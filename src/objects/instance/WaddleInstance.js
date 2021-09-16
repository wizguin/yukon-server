export default class WaddleInstance {

    constructor(waddle) {
        this.users = [...waddle.users]

        this.ready = []
        this.started = false

        this.payouts = []
        this.minPayout = 5
    }

    init() {
        for (let user of this.users) {
            user.waddle = this
            user.joinRoom(user.handler.rooms[this.id])
        }
    }

    // Events

    startGame(user) {
        if (!this.started && !this.ready.includes(user)) {
            this.ready.push(user)

            this.checkStart()
        }
    }

    sendMove(args, user) {
        // To be overridden in derived class
    }

    // Functions

    getPayout(user, score) {
        this.remove(user)

        return this.payouts[score] || this.minPayout
    }

    checkStart() {
        // Compare with non null values in case user disconnects
        if (this.ready.length == this.users.filter(Boolean).length) {
            this.gameReady()
        }
    }

    gameReady() {
        this.started = true
    }

    remove(user) {
        // Remove from users
        let seat = this.users.indexOf(user)
        this.users[seat] = null

        // Remove from ready
        this.ready = this.ready.filter(u => u != user)

        user.waddle = null

        if (!this.started) {
            this.checkStart()
        }
    }

    send(action, args = {}, user = null, filter = [user]) {
        let users = this.users.filter(u => !filter.includes(u)).filter(Boolean)

        for (let u of users) {
            u.send(action, args)
        }
    }

}
