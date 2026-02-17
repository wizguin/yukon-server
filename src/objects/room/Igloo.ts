import Room from './Room'

import { config } from '@config'
import type GameUser from '@objects/user/GameUser'
import type { IglooUpdateInput } from '../../generated/prisma/models'
import PrismaDatabase from '@database/PrismaDatabase'

interface Furniture {
    userId: number
    furnitureId: number
    x: number
    y: number
    rotation: number
    frame: number
}

export default class Igloo extends Room {

    isIgloo = true

    constructor(
        public userId: number,
        public type: number,
        public flooring: number,
        public music: number,
        public location: number,
        public furniture: Furniture[] = []
    ) {
        super({})

        this.id = userId + config.game.iglooIdOffset
    }

    add(user: GameUser) {
        this.users[user.socket.id] = user

        user.send('join_igloo', this)
        this.send(user, 'add_player', { user })
    }

    refresh(user: GameUser) {
        for (const u of this.userValues) {
            u.x = 0
            u.y = 0
            u.frame = 1
        }
        this.send(user, 'join_igloo', this, [])
    }

    async update(data: IglooUpdateInput) {
        try {
            await PrismaDatabase.igloo.update({
                where: {
                    userId: this.userId
                },
                data
            })

        } catch (error) {
            console.error(error)
        }
    }

    async clearFurniture() {
        await PrismaDatabase.furniture.deleteMany({
            where: { userId: this.userId }
        })

        this.furniture = []
    }

    toJSON() {
        return {
            igloo: this.userId,
            users: this.userValues,
            type: this.type,
            flooring: this.flooring,
            music: this.music,
            location: this.location,
            furniture: this.furniture
        }
    }

}
