import type GameHandler from '../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

export default class BaseInstance {

    users: (GameUser | null)[]
    ready: GameUser[] = []
    started = false

    constructor(waddle: any, private id: number) {
        this.users = [...waddle.users]

        this.handleStartGame = this.handleStartGame.bind(this)
        this.handleLeaveGame = this.handleLeaveGame.bind(this)
    }

    init() {
        for (const user of this.users) {
            if (!user) {
                continue
            }

            this.addListeners(user)

            user.joinRoom((user.handler as GameHandler).rooms[this.id])

            user.minigameRoom = this
        }
    }

    addListeners(user: GameUser) {
        // @ts-expect-error temp
        user.events.on('start_game', this.handleStartGame)
        // @ts-expect-error temp
        user.events.on('leave_game', this.handleLeaveGame)
    }

    removeListeners(user: GameUser) {
        // @ts-expect-error temp
        user.events.off('start_game', this.handleStartGame)
        // @ts-expect-error temp
        user.events.off('leave_game', this.handleLeaveGame)
    }

    handleStartGame(_args: any, user: GameUser) {
        if (!this.started && !this.ready.includes(user)) {
            this.ready.push(user)

            this.checkStart()
        }
    }

    handleLeaveGame(_args: any, user: GameUser) {
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

    remove(user: GameUser) {
        this.removeListeners(user)

        // Remove from users
        const seat = this.getSeat(user)
        this.users[seat] = null

        // Remove from ready
        this.ready = this.ready.filter(u => u != user)

        user.minigameRoom = null
    }

    getSeat(user: GameUser) {
        return this.users.indexOf(user)
    }

    send(action: string, args = {}, user: GameUser | null = null, filter = [user]) {
        const users = this.users.filter(u => !filter.includes(u)).filter(Boolean)

        for (const u of users) {
            if (u) {
                u.send(action, args)
            }
        }
    }

}
