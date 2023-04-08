import InstanceFactory from '@objects/instance/InstanceFactory'


export default class Waddle {

    constructor(data) {
        Object.assign(this, data)

        this.users = new Array(data.seats).fill(null)
    }

    get notFull() {
        return this.users.includes(null)
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
        user.room.send(user, 'update_waddle', { waddle: this.id, seat: seat, username: user.username }, [])
    }

    remove(user) {
        let seat = this.users.indexOf(user)
        this.users[seat] = null

        user.waddle = null

        user.room.send(user, 'update_waddle', { waddle: this.id, seat: seat, username: null }, [])
    }

    start() {
        let instance = InstanceFactory.createInstance(this)

        this.reset()
        instance.init()
    }

    reset() {
        for (let user of this.users.filter(Boolean)) {
            this.remove(user)
        }
    }

}
