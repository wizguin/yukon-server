import type GameUser from '@objects/user/GameUser'
import type Room from '../Room'

export default class BaseTable {

    users: GameUser[] = []
    started = false
    currentTurn = 1

    id!: number
    roomId!: number
    game!: string
    map: any[] = []

    constructor(table: any, private room: Room) {
        Object.assign(this, table)

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

    isPlayingUser(user: GameUser) {
        return this.playingUsers.includes(user.username)
    }

    getGame(args: any, user: GameUser) {
        user.send('get_game', this)
    }

    joinGame(args: any, user: GameUser) {
        if (this.started) {
            return
        }

        const turn = this.users.indexOf(user) + 1

        user.send('join_game', { turn })
        this.send('update_game', { username: user.username, turn })

        if (this.users.length == 2) {
            this.started = true
            this.send('start_game')
        }
    }

    add(user: GameUser) {
        this.users.push(user)

        const seat = this.users.length

        user.send('join_table', { table: this.id, seat, game: this.game })
        user.room?.send(user, 'update_table', { table: this.id, seat }, [])
    }

    remove(user: GameUser) {
        if (this.started && this.isPlayingUser(user)) {
            this.reset(user.username)

        } else {
            this.users = this.users.filter(u => u != user)

            user.minigameRoom = null
            user.room?.send(user, 'update_table', { table: this.id, seat: this.users.length }, [])
        }
    }

    reset(quittingUser: string | null = null) {
        for (const user of this.users) {
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

    send(action: string, args = {}) {
        for (const user of this.users) {
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
