import Room from './Room'

import Database from '@database/Database'
import type GameUser from '@objects/user/GameUser'


interface Furniture {
    furnitureId: number
    x: number
    y: number
    rotation: number
    frame: number
}

export default class Igloo extends Room {

    isIgloo = true

    userId: number
    type: number
    flooring: number
    music: number
    location: number
    furniture: Furniture[]

    constructor(
        data: any,
        private db: Database,
        private iglooIdOffset: number
    ) {
        super(data)

        this.userId = data.userId
        this.type = data.type
        this.flooring = data.flooring
        this.music = data.music
        this.location = data.location
        this.furniture = data.furniture

        this.id = data.userId + this.iglooIdOffset
    }

    add(user: GameUser) {
        this.users[user.socket.id] = user

        user.send('join_igloo', this)
        this.send(user, 'add_player', { user: user })
    }

    refresh(user: GameUser) {
        for (let u of this.userValues) {
            u.x = 0
            u.y = 0
            u.frame = 1
        }
        this.send(user, 'join_igloo', this, [])
    }

    update(query: any) {
        this.db.igloos.update(query, { where: { userId: this.userId } })
    }

    async clearFurniture() {
        await this.db.furnitures.destroy({ where: { userId: this.userId } })
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
