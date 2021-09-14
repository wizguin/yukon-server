import SledInstance from '../instance/SledInstance'


export default class WaddleRoom {

    constructor(data) {
        Object.assign(this, data)

        this.users = new Array(data.seats).fill(null)
    }

    add(user) {
        let seat = this.users.indexOf(null)
        this.users[seat] = user

        user.waddle = this

        // Start game
        if (!this.users.includes(null)) {
            return this.start()
        }

        user.send('join_waddle', { waddle: this.id, seat: seat })
        user.room.send(user, 'update_waddle', { waddle: this.id, seat: seat, username: user.data.username }, [])
    }

    remove(user) {
        let seat = this.users.indexOf(user)
        this.users[seat] = null

        user.waddle = null

        user.room.send(user, 'update_waddle', { waddle: this.id, seat: seat, username: null }, [])
    }

    start() {
        let instance = new SledInstance(this)

        this.reset()
        instance.init()
    }

    reset() {
        for (let [seat, user] of this.users.entries()) {
            if (user) {
                this.users[seat] = null
                user.room.send(user, 'update_waddle', { waddle: this.id, seat: seat, username: null }, [])
            }
        }
    }

}
