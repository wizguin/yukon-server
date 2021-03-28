import Room from './Room'


export default class Igloo extends Room {

    constructor(data) {
        super(data)
    }

    add(user) {
        this.users[user.socket.id] = user

        user.send('join_igloo', {
            igloo: this.id,
            users: this.strings,
            type: this.type,
            flooring: this.flooring,
            music: this.music,
            location: this.location,
            furniture: this.furniture
        })
        this.send(user, 'add_player', { user: user.string })
    }

}
