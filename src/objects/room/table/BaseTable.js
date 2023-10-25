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

    getGame(args, user) {
        user.send('get_game', this)
    }

    joinGame(args, user) {
        if (this.started) {
            return
        }

        let turn = this.users.indexOf(user) + 1

        user.send('join_game', { turn: turn })
        this.send('update_game', { username: user.username, turn: turn })

        if (this.users.length == 2) {
            this.started = true
            this.send('start_game')
        }
    }

    add(user) {
        this.users.push(user)

        let seat = this.users.length

        user.send('join_table', { table: this.id, seat: seat, game: this.game })
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
            this.send('close_game', { gameOver: true })
        }

        this.init()
        this.room.send(null, 'update_table', { table: this.id, seat: this.users.length })
    }

    send(action, args = {}) {
        for (let user of this.users) {
            user.send(action, args)
        }
    }

    toJSON() {
        return {
            users: this.playingUsers,
            map: this.map
        }
    }

}
