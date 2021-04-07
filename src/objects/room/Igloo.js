import Room from './Room'


export default class Igloo extends Room {

    constructor(data, db) {
        super(data)

        this.db = db
    }

    add(user) {
        this.users[user.socket.id] = user

        user.send('join_igloo', {
            igloo: this.userId,
            users: this.strings,
            type: this.type,
            flooring: this.flooring,
            music: this.music,
            location: this.location,
            furniture: this.furniture
        })
        this.send(user, 'add_player', { user: user.string })
    }

    update(query) {
        this.db.userIgloos.update(query, { where: { userId: this.userId }})
    }

    async clearFurniture() {
        await this.db.userFurnitures.destroy({ where: { userId: this.userId } })
        this.furniture = []
    }

}
