import Database from '@database/Database'
import Igloo from '@objects/room/Igloo'

import BuddyCollection from '@database/collections/BuddyCollection'
import CardCollection from '@database/collections/CardCollection'
import FurnitureCollection from '@database/collections/FurnitureCollection'
import IglooCollection from '@database/collections/IglooCollection'
import IgnoreCollection from '@database/collections/IgnoreCollection'
import InventoryCollection from '@database/collections/InventoryCollection'
import PetCollection from '@database/collections/PetCollection'
import PostcardCollection from '@database/collections/PostcardCollection'

import type { Action, Args } from '../../server/Server'
import type { Ban } from '../../generated/prisma/client'
import type BaseInstance from '@objects/instance/BaseInstance'
import type BaseTable from '@objects/room/table/BaseTable'
import type Handler from '../../handler/Handler'
import type Pet from '@objects/pet/Pet'
import type { Postcard } from '@database/collections/PostcardCollection'
import type Room from '@objects/room/Room'
import type { UserUpdateInput } from '../../generated/prisma/models'
import type Waddle from '@objects/room/waddle/Waddle'

import { furniture, igloos, items } from '@data'
import { FurnitureLimitError, InsufficientCoinsError, isUniqueConstraintError } from '@utils/error'
import { clamp } from '@utils/math'
import getSocketAddress from './getSocketAddress'
import pick from '@utils/pick'

import EventEmitter from 'events'
import type { Socket } from 'socket.io'
import type { TransactionClient } from '../../generated/prisma/internal/prismaNamespace'

const tourItem = 428
const tourPostcard = 126
const agentItem = 800
const agentPostcard = 127

const slots = ['color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo', 'award']

interface Token {
    selector?: string
    validatorHash?: string
    oldSelector?: string
}

export default class User {

    handler: Handler
    socket: Socket
    address: string

    gameAuthSent = false
    authenticated = false
    joinedServer = false
    isModerator = false

    token: Token = {}

    x = 0
    y = 0
    frame = 0

    room: Room | Igloo | null = null
    waddle: Waddle | null = null
    minigameRoom: BaseInstance | BaseTable | null = null

    buddyRequests: number[] = []
    walkingPet: Pet | null = null

    events: EventEmitter
    cooldowns: Record<string, number> = {}

    id!: number
    username!: string
    rank!: number
    permaBan!: boolean
    joinTime!: Date
    coins!: number
    head!: number
    face!: number
    neck!: number
    body!: number
    hand!: number
    feet!: number
    color!: number
    photo!: number
    flag!: number
    ninjaRank!: number
    ninjaProgress!: number

    ban: Ban | null = null

    buddies!: BuddyCollection
    ignores!: IgnoreCollection
    inventory!: InventoryCollection
    igloos!: IglooCollection
    furniture!: FurnitureCollection
    cards!: CardCollection
    postcards!: PostcardCollection
    pets!: PetCollection

    constructor(handler: Handler, socket: Socket) {
        this.handler = handler
        this.socket = socket

        this.address = getSocketAddress(socket)

        // Used for temporary events
        this.events = new EventEmitter({ captureRejections: true })

        this.events.on('error', error => {
            this.handler.handleError(error)
        })
    }

    send(action: Action, args: Args = {}) {
        this.socket.emit('message', { action, args })
    }

    close() {
        this.socket.disconnect(true)
    }

    getId() {
        return this.id ? this.id : this.socket.id
    }

    inOwnIgloo() {
        return this.room instanceof Igloo && this.room.userId === this.id
    }

    setItem(slot: string, item: number) {
        // @ts-expect-error temp
        if (this[slot] === item) {
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

        x = clamp(x, 0, 1520)
        y = clamp(y, 0, 960)

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

    async addItem(itemId: number, notify = true) {
        if (this.inventory.includes(itemId)) {
            this.send('error', { error: 'You already have this item.' })
            return
        }

        const item = items[itemId]

        if (!item) {
            return
        }

        if (item.patched) {
            this.send('error', { error: 'This item is not currently available.' })
            return
        }

        try {
            await this.inventory.add(itemId, item.cost)

        } catch (error) {
            if (isUniqueConstraintError(error)) {
                this.send('error', { error: 'You already have this item.' })
                return
            }

            if (error instanceof InsufficientCoinsError) {
                this.send('error', { error: 'You need more coins.' })
                return
            }

            throw error
        }

        if (itemId === tourItem) {
            await this.addSystemMail(tourPostcard)
        }

        if (itemId === agentItem) {
            await this.addSystemMail(agentPostcard)
        }

        if (notify) {
            this.send('add_item', {
                item: itemId,
                name: item.name,
                slot: slots[item.type - 1],
                coins: this.coins
            })
        }
    }

    async addFurniture(furnitureId: number, notify = true) {
        const item = furniture[furnitureId]

        if (!item) {
            return
        }

        if (item.patched) {
            this.send('error', { error: 'This item is not currently available.' })
            return
        }

        try {
            await this.furniture.add(furnitureId, item.cost, item.max)

        } catch (error) {
            if (error instanceof FurnitureLimitError) {
                return
            }

            if (error instanceof InsufficientCoinsError) {
                this.send('error', { error: 'You need more coins.' })
                return
            }

            throw error
        }

        if (notify) {
            this.send('add_furniture', { furniture: furnitureId, coins: this.coins })
        }
    }

    async addIgloo(iglooId: number, notify = true) {
        if (this.igloos.includes(iglooId)) {
            this.send('error', { error: 'You already have this item.' })
            return
        }

        const igloo = igloos[iglooId]

        if (!igloo) {
            return
        }

        if (igloo.patched) {
            this.send('error', { error: 'This item is not currently available.' })
            return
        }

        try {
            await this.igloos.add(iglooId, igloo.cost)

        } catch (error) {
            if (isUniqueConstraintError(error)) {
                this.send('error', { error: 'You already have this item.' })
                return
            }

            if (error instanceof InsufficientCoinsError) {
                this.send('error', { error: 'You need more coins.' })
                return
            }

            throw error
        }

        if (notify) {
            this.send('add_igloo', { igloo: iglooId, coins: this.coins })
        }
    }

    /**
     * Run an operation and deduct its cost in one transaction.
     * Updates in-memory coins after commit.
     *
     * @param cost - Coin cost.
     * @param operation - Database operation using the transaction client.
     * @param prepare - Optional transaction setup.
     */
    async purchase<T>(
        cost: number,
        operation: (tx: TransactionClient) => Promise<T>,
        prepare?: (tx: TransactionClient) => Promise<void>
    ) {
        const { result, coins } = await Database.$transaction(async tx => {
            await prepare?.(tx)

            const user = await this.lockUserCoins(tx)

            // Read coins from locked row
            if (user.coins < cost) {
                throw new InsufficientCoinsError()
            }

            const result = await operation(tx)

            const updatedUser = await tx.user.update({
                where: {
                    id: this.id
                },
                data: {
                    coins: {
                        decrement: cost
                    }
                },
                select: {
                    coins: true
                }
            })

            return { result, coins: updatedUser.coins }
        })

        this.coins = coins

        return result
    }

    async addCoins(amount: number, gameOver = false) {
        if (!Number.isSafeInteger(amount)) {
            throw new Error('Coin amount must be a safe integer')
        }

        const coins = await Database.$transaction(async tx => {
            const user = await this.lockUserCoins(tx)

            const coins = clamp(user.coins + amount, 0, 1_000_000_000)

            const updatedUser = await tx.user.update({
                where: {
                    id: this.id
                },
                data: {
                    coins
                },
                select: {
                    coins: true
                }
            })

            return updatedUser.coins
        })

        this.coins = coins

        if (gameOver) {
            this.send('game_over', { coins })
        }

        return coins
    }

    /** Acquire this user's row lock and read its balance. */
    private async lockUserCoins(tx: TransactionClient) {
        const users = await tx.$queryRaw<{ coins: number }[]>`
            SELECT coins FROM users WHERE id = ${this.id} FOR UPDATE
        `

        const user = users[0]

        if (!user) {
            throw new Error(`User ${this.id} does not exist`)
        }

        return user
    }

    addBuddy(id: number, username: string, requester = false) {
        this.buddies.add(id)

        const online = id in this.handler.usersById

        this.send('buddy_accept', { id, username, requester, online })
    }

    async removeBuddy(id: number) {
        await this.buddies.remove(id)

        this.send('buddy_remove', { id })
    }

    clearBuddyRequest(id: number) {
        this.buddyRequests = this.buddyRequests.filter(request => request !== id)
    }

    async addSystemMail(postcardId: number, details?: string) {
        const postcard = await this.postcards.addSystem(postcardId, details)

        this.send('receive_mail', postcard)

        return postcard
    }

    receiveMail(record: Postcard) {
        this.postcards.collect(record)

        const postcard = this.postcards.formatPostcard(record)

        this.send('receive_mail', postcard)

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

            this.ban = bans[0] ?? null

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
            this.handler.handleError(error)

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

    async update(data: UserUpdateInput) {
        if (!this.id) {
            return
        }

        try {
            await Database.user.update({
                where: {
                    id: this.id
                },
                data
            })

            Object.assign(this, data)

        } catch (error) {
            console.error(error)
        }
    }

    setPermissions() {
        this.isModerator = this.rank >= 2
    }

    get anonymous() {
        return pick(this,
            'id',
            'username',
            'head',
            'face',
            'neck',
            'body',
            'hand',
            'feet',
            'color',
            'photo',
            'flag'
        )
    }

}
