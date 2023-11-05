export default class BaseInstance {

    constructor(waddle) {
        this.users = [...waddle.users]

        // Don't start until all users are ready
        this.ready = []

        // Game room ID
        this.id = null

        this.started = false

        this.handleStartGame = this.handleStartGame.bind(this)
        this.handleLeaveGame = this.handleLeaveGame.bind(this)
    }

    init() {
        for (let user of this.users) {
            this.addListeners(user)

            user.joinRoom(user.handler.rooms[this.id])

            user.minigameRoom = this
        }
    }

    addListeners(user) {
        user.events.on('start_game', this.handleStartGame)
        user.events.on('leave_game', this.handleLeaveGame)
    }

    removeListeners(user) {
        user.events.off('start_game', this.handleStartGame)
        user.events.off('leave_game', this.handleLeaveGame)
    }

    handleStartGame(args, user) {
        if (!this.started && !this.ready.includes(user)) {
            this.ready.push(user)

            this.checkStart()
        }
    }

    handleLeaveGame(args, user) {
        this.remove(user)
    }

    checkStart() {
        // Compare with non null values in case user disconnects
        if (this.ready.length == this.users.length) {
            this.start()
        }
    }

    start() {
        this.started = true
    }

    remove(user) {
        this.removeListeners(user)

        // Remove from users
        let seat = this.getSeat(user)
        this.users[seat] = null

        // Remove from ready
        this.ready = this.ready.filter(u => u != user)

        user.minigameRoom = null
    }

    getSeat(user) {
        return this.users.indexOf(user)
    }

    send(action, args = {}, user = null, filter = [user]) {
        let users = this.users.filter(u => !filter.includes(u)).filter(Boolean)

        for (let u of users) {
            u.send(action, args)
        }
    }

}
