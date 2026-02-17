import User from './User'

import BuddyCollection from '@database/collections/BuddyCollection'
import CardCollection from '@database/collections/CardCollection'
import FurnitureCollection from '@database/collections/FurnitureCollection'
import IglooCollection from '@database/collections/IglooCollection'
import IgnoreCollection from '@database/collections/IgnoreCollection'
import InventoryCollection from '@database/collections/InventoryCollection'
import PetCollection from '@database/collections/PetCollection'
import PostcardCollection from '@database/collections/PostcardCollection'

import PurchaseValidator from './purchase/PurchaseValidator'

import type BaseInstance from '@objects/instance/BaseInstance'
import type BaseTable from '@objects/room/table/BaseTable'
import Igloo from '@objects/room/Igloo'
import type Pet from '@objects/pet/Pet'
import Database from '@database/Database'
import type Room from '@objects/room/Room'
import type Server from '../../server/Server'
import type Waddle from '@objects/room/waddle/Waddle'

import { isInRange } from '@utils/validation'
import pick from '@utils/pick'

import EventEmitter from 'events'
import type { Socket } from 'socket.io'

interface Token {
    selector?: string
    validatorHash?: string
    oldSelector?: string
}

export default class GameUser extends User {

    crumbs: any

    gameAuthSent = false
    authenticated = false
    joinedServer = false

    token: Token = {}

    x = 0
    y = 0
    frame = 0

    room: Room | Igloo | null = null
    waddle: Waddle | null = null
    minigameRoom: BaseInstance | BaseTable | null = null

    buddyRequests: number[] = []
    walkingPet: Pet | null = null

    validatePurchase: PurchaseValidator

    buddies!: BuddyCollection
    ignores!: IgnoreCollection
    inventory!: InventoryCollection
    igloos!: IglooCollection
    furniture!: FurnitureCollection
    cards!: CardCollection
    postcards!: PostcardCollection
    pets!: PetCollection

    constructor(server: Server, socket: Socket) {
        super(server, socket)

        // @ts-expect-error temp
        this.crumbs = this.handler.crumbs

        this.validatePurchase = new PurchaseValidator(this)

        // Used for dynamic/temporary events
        this.events = new EventEmitter({ captureRejections: true })

        this.events.on('error', error => {
            this.handler.error(error)
        })
    }

    inOwnIgloo() {
        return this.room instanceof Igloo && this.room.userId === this.id
    }

    setItem(slot: string, item: number) {
        // @ts-expect-error temp
        if (this[slot] == item) {
            return
        }

        this.update({ [slot]: item })
        this.sendUpdatePlayer(slot, item)
    }

    sendUpdatePlayer(slot: string, item: number) {
        if (this.room) {
            this.room.send(this, 'update_player', { id: this.id, item, slot }, [])
        }
    }

    joinRoom(room: Room, x = 0, y = 0) {
        if (!room || room === this.room || this.minigameRoom || this.waddle) {
            return
        }

        if (room.isFull && !this.isModerator) {
            return this.send('error', { error: 'Sorry this room is currently full' })
        }

        if (!isInRange(x, 0, 1520)) {
            x = 0
        }

        if (!isInRange(y, 0, 960)) {
            y = 0
        }

        if (this.room) {
            this.room.remove(this)
        }

        this.room = room
        this.x = x
        this.y = y
        this.frame = 1

        this.room.add(this)
    }

    joinTable(table: BaseTable) {
        if (table && !this.minigameRoom) {
            this.minigameRoom = table

            this.minigameRoom.add(this)
        }
    }

    addBuddy(id: number, username: string, requester = false) {
        this.buddies.add(id)

        // @ts-expect-error temp
        const online = id in this.handler.usersById

        this.send('buddy_accept', { id, username, requester, online })
    }

    removeBuddy(id: number) {
        this.buddies.remove(id)

        this.send('buddy_remove', { id })
    }

    clearBuddyRequest(id: number) {
        this.buddyRequests = this.buddyRequests.filter(request => request != id)
    }

    updateCoins(coins: number | string, gameOver = false) {
        if (typeof coins === 'string') {
            coins = parseInt(coins)
        }

        if (!isNaN(coins)) {
            coins = Math.max(Math.min(1000000000, this.coins + coins), 0)

            this.update({ coins })
        }

        if (gameOver) {
            this.send('game_over', { coins: coins || this.coins })
        }
    }

    async addSystemMail(postcardId: number, details?: string) {
        const postcard = await this.postcards.addSystem(postcardId, details)

        if (postcard) {
            this.send('receive_mail', postcard)
        }

        return postcard
    }

    async startWalkingPet(petId: number) {
        const pet = this.pets.get(petId)

        if (!pet) {
            return
        }

        if (this.walkingPet) {
            this.stopWalkingPet()
        }

        if (pet.rest < 20 || pet.energy < 40) {
            return
        }

        pet.walking = true
        this.walkingPet = pet

        if (this.room) {
            this.room.send(this, 'pet_start_walk', { userId: this.id, petId: pet.id }, [])
        }

        // Remove current hand item
        await this.update({ hand: 0 })

        // Set hand item to pet without updating database
        const petItemId = pet.typeId + 750

        this.hand = petItemId
        this.sendUpdatePlayer('hand', petItemId)
    }

    stopWalkingPet() {
        if (this.walkingPet) {
            if (this.room) {
                this.room.send(this, 'pet_stop_walk', { userId: this.id, petId: this.walkingPet.id }, [])
            }

            this.walkingPet.walking = false
            this.walkingPet = null
        }
    }

    async load(username: string) {
        try {
            const user = await Database.user.findFirst({
                where: {
                    username
                },
                include: {
                    bans: {
                        where: {
                            expires: {
                                gt: new Date()
                            }
                        },
                        take: 1
                    },

                    buddies: {
                        include: {
                            buddy: { select: { username: true } }
                        }
                    },

                    cards: true,

                    furnitureInventory: true,

                    ignores: {
                        include: {
                            ignore: { select: { username: true } }
                        }
                    },

                    iglooInventory: true,

                    inventory: true,

                    pets: true,

                    postcards: {
                        include: {
                            sender: { select: { username: true } }
                        }
                    }
                }
            })

            if (!user) {
                return false
            }

            const {
                bans,
                buddies,
                cards,
                furnitureInventory,
                ignores,
                iglooInventory,
                inventory,
                pets,
                postcards,
                ...rest
            } = user

            Object.assign(this, rest)

            this.buddies = new BuddyCollection(this, buddies)
            this.cards = new CardCollection(this, cards)
            this.furniture = new FurnitureCollection(this, furnitureInventory)
            this.igloos = new IglooCollection(this, iglooInventory)
            this.ignores = new IgnoreCollection(this, ignores)
            this.inventory = new InventoryCollection(this, inventory)
            this.pets = new PetCollection(this, pets)
            this.postcards = new PostcardCollection(this, postcards)

            this.setPermissions()

            return true

        } catch (error) {
            if (error instanceof Error) {
                this.handler.error(error)
            }

            return false
        }
    }

    toJSON() {
        return pick(this,
            'id',
            'username',
            'joinTime',
            'head',
            'face',
            'neck',
            'body',
            'hand',
            'feet',
            'color',
            'photo',
            'flag',
            'x',
            'y',
            'frame'
        )
    }

}
