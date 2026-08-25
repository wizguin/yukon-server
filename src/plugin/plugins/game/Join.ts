import GamePlugin from '@plugin/GamePlugin'

import { X, Y } from '@utils/validation'
import { config } from '@config'
import Database from '@database/Database'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'
import Igloo from '@objects/room/Igloo'

import { type } from 'arktype'

const JoinRoom = type({
    room: 'number',
    'x?': X,
    'y?': Y
})

const JoinIgloo = type({
    igloo: 'number',
    'x?': X,
    'y?': Y
})

export default class Join extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            join_server: this.joinServer,
            join_room: this.joinRoom,
            join_igloo: this.joinIgloo
        }
    }

    async joinServer(args: unknown, user: GameUser) {
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

    joinRoom(args: unknown, user: GameUser) {
        const { room, x, y } = JoinRoom.assert(args)

        user.joinRoom(this.rooms[room], x, y)
    }

    async joinIgloo(args: unknown, user: GameUser) {
        const { igloo: iglooId, x, y } = JoinIgloo.assert(args)

        const igloo = await this.getIgloo(iglooId)

        if (igloo) {
            user.joinRoom(igloo, x, y)
        }
    }

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
