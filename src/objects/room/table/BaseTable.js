export default class BaseTable {

    constructor(table, room) {
        Object.assign(this, table)

        this.room = room

        this.init()
    }

    init() {
        this.users = []
        this.started = false
        this.currentTurn = 1
    }

    get playingUsers() {
        return this.users.slice(0, 2).map(user => user.username)
    }

    isPlayingUser(user) {
        return this.playingUsers.includes(user.username)
    }

    add(user) {
        this.users.push(user)

        let seat = this.users.length

        user.send('join_table', { table: this.id, seat: seat })
        user.room.send(user, 'update_table', { table: this.id, seat: seat }, [])
    }

    remove(user) {
        if (this.started && this.isPlayingUser(user)) {
            this.reset(user.username)

        } else {
            this.users = this.users.filter(u => u != user)

            user.minigameRoom = null
            user.room.send(user, 'update_table', { table: this.id, seat: this.users.length }, [])
        }
    }

    reset(quittingUser = null) {
        for (let user of this.users) {
            user.minigameRoom = null
        }

        if (quittingUser) {
            this.send('close_game', { username: quittingUser })
        } else {
            this.send('close_game')
        }

        this.init()
        this.room.send(null, 'update_table', { table: this.id, seat: this.users.length })
    }

    send(action, args = {}) {
        for (let user of this.users) {
            user.send(action, args)
        }
    }

}
