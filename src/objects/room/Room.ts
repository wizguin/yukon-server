import type { Action, Args } from '../../server/Server'
import type BaseTable from './table/BaseTable'
import type CardMatchmaker from './matchmaker/CardMatchmaker'
import type GameUser from '@objects/user/GameUser'
import type Waddle from './waddle/Waddle'

export default class Room {

    users: Record<string, GameUser> = {}
    tables: Record<string, BaseTable> = {}
    waddles: Record<string, Waddle> = {}

    id!: number
    name!: string
    member!: number
    maxUsers!: number
    game!: number
    spawn!: number

    matchmaker?: CardMatchmaker

    constructor(data: any) {
        Object.assign(this, data)
    }

    get userValues() {
        return Object.values(this.users)
    }

    get isFull() {
        return Object.keys(this.users).length >= this.maxUsers
    }

    add(user: GameUser) {
        this.users[user.socket.id] = user

        if (this.game) {
            return user.send('join_game_room', { game: this.id })
        }

        user.send('join_room', { room: this.id, users: this.userValues })
        this.send(user, 'add_player', { user })
    }

    remove(user: GameUser) {
        if (!this.game) {
            this.send(user, 'remove_player', { user: user.id })
        }

        if (this.matchmaker && this.matchmaker.includes(user)) {
            this.matchmaker.remove(user)
        }

        delete this.users[user.socket.id]
    }

    /**
     * Sends a packet to all users in the room, by default the client is excluded.
     *
     * @param {User} user - Client User object
     * @param {string} action - Packet name
     * @param {object} args - Packet arguments
     * @param {Array} filter - Users to exclude
     * @param {boolean} checkIgnore - Whether or not to exclude users who have user added to their ignore list
     */
    send(user: GameUser | null, action: Action, args: Args = {}, filter: (GameUser | null)[] = [user], checkIgnore: boolean = false) {
        const users = this.userValues.filter(u => !filter.includes(u))

        for (const u of users) {
            if (user && checkIgnore && u.ignores.includes(user.id)) {
                continue
            }

            u.send(action, args)
        }
    }

}
