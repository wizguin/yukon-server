export default class RoomWaddle {

    constructor(data) {
        Object.assign(this, data)

        this.users = new Array(data.seats).fill(null)
    }

    get usernames() {
        return this.users.map(user => (user) ? user.data.username : null)
    }

    add(user) {
        let seat = this.users.indexOf(null)
        this.users[seat] = user

        user.waddle = this

        user.send('join_waddle', { waddle: this.id, seat: seat })
        user.room.send(user, 'update_waddle', { waddle: this.id, seat: seat, username: user.data.username }, [])
    }

    remove(user) {
        let seat = this.users.indexOf(user)
        this.users[seat] = null

        user.waddle = null

        user.room.send(user, 'update_waddle', { waddle: this.id, seat: seat, username: null }, [])
    }

}
