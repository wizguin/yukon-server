import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import { config } from '@config'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'
import Database from '@database/Database'

import { isNumber } from '@utils/validation'

import Igloo from '@objects/room/Igloo'

export default class Join extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            join_server: this.joinServer,
            join_room: this.joinRoom,
            join_igloo: this.joinIgloo
        }
    }

    // Events

    async joinServer(args: Args, user: GameUser) {
        if (user.joinedServer) {
            return
        }

        user.send('load_player', {
            user,
            rank: user.rank,
            coins: user.coins,
            buddies: user.buddies,
            ignores: user.ignores,
            inventory: user.inventory,
            igloos: user.igloos,
            furniture: user.furniture,
            postcards: user.postcards,
            pets: user.pets
        })

        // Update token on database now that user has fully connected
        if (user.token.oldSelector) {
            await Database.authToken.delete({
                where: {
                    userId_selector: {
                        userId: user.id,
                        selector: user.token.oldSelector
                    }
                }
            })
        }

        if (user.token.selector && user.token.validatorHash) {
            await Database.authToken.create({
                data: {
                    userId: user.id,
                    selector: user.token.selector,
                    validator: user.token.validatorHash
                }
            })
        }

        const spawn = this.getSpawn()
        user.joinRoom(spawn)

        user.joinedServer = true

        user.buddies.sendOnline()

        // @ts-expect-error temp
        await this.handler.updateWorldPopulation()
    }

    joinRoom(args: Args, user: GameUser) {
        if (!isNumber(args.room)) {
            return
        }

        user.joinRoom(this.rooms[args.room], args.x, args.y)
    }

    async joinIgloo(args: Args, user: GameUser) {
        const igloo = await this.getIgloo(args.igloo)

        if (igloo) {
            user.joinRoom(igloo, args.x, args.y)
        }
    }

    // Functions

    getSpawn() {
        const preferredSpawn = config.game.preferredSpawn

        if (preferredSpawn && !this.rooms[preferredSpawn].isFull) {
            return this.rooms[preferredSpawn]
        }

        let spawns = Object.values(this.rooms).filter(room => room.spawn && !room.isFull)

        // All spawns full
        if (!spawns.length) {
            spawns = Object.values(this.rooms).filter(room => !room.game && !room.isFull)
        }

        return spawns[Math.floor(Math.random() * spawns.length)]
    }

    async getIgloo(userId: number) {
        if (!isNumber(userId)) {
            return null
        }

        // Ensures igloos are above all default rooms
        const iglooId = userId + config.game.iglooIdOffset

        if (!(iglooId in this.rooms)) {
            const igloo = await Database.igloo.findUnique({
                where: { userId }
            })

            if (!igloo) {
                return null
            }

            const furniture = await Database.furniture.findMany({
                where: { userId }
            })

            this.rooms[iglooId] = new Igloo(
                userId,
                igloo.type,
                igloo.flooring,
                igloo.music,
                igloo.location,
                furniture
            )
        }

        return this.rooms[iglooId]
    }

}
