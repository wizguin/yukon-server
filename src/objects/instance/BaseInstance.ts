import type GameHandler from '../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

export type InstanceUsers = (GameUser | null)[]

export default class BaseInstance {

    private roomId: number

    users: InstanceUsers
    ready: GameUser[] = []
    started = false

    private readonly startGameListener = this.handleStartGame.bind(this)
    private readonly leaveGameListener = this.handleLeaveGame.bind(this)

    constructor(users: InstanceUsers, roomId: number) {
        this.users = [...users]
        this.roomId = roomId
    }

    init() {
        for (const user of this.users) {
            if (!user) {
                continue
            }

            this.addListeners(user)

            user.joinRoom((user.handler as GameHandler).rooms[this.roomId])

            user.minigameRoom = this
        }
    }

    addListeners(user: GameUser) {
        user.events?.on('start_game', this.startGameListener)
        user.events?.on('leave_game', this.leaveGameListener)
    }

    removeListeners(user: GameUser) {
        user.events?.off('start_game', this.startGameListener)
        user.events?.off('leave_game', this.leaveGameListener)
    }

    handleStartGame(_args: unknown, user: GameUser) {
        if (!this.started && !this.ready.includes(user)) {
            this.ready.push(user)

            this.checkStart()
        }
    }

    handleLeaveGame(_args: unknown, user: GameUser) {
        this.remove(user)
    }

    checkStart() {
        // Compare with non null values in case user disconnects
        if (this.ready.length === this.users.length) {
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
        this.ready = this.ready.filter(u => u !== user)

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
