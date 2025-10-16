import Room from './Room'


export default class Igloo extends Room {

    constructor(data, db, iglooIdOffset) {
        super(data)

        this.db = db
        this.iglooIdOffset = iglooIdOffset

        this.isIgloo = true
    }

    get id() {
        return this.userId + this.iglooIdOffset
    }

    add(user) {
        this.users[user.socket.id] = user

        user.send('join_igloo', this)
        this.send(user, 'add_player', { user: user })
    }

    refresh(user) {
        for (let u of this.userValues) {
            u.x = 0
            u.y = 0
            u.frame = 1
        }
        this.send(user, 'join_igloo', this, [])
    }

    update(query) {
        this.db.igloos.update(query, { where: { userId: this.userId }})
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
