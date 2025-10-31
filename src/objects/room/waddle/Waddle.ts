import type GameUser from '@objects/user/GameUser'
import InstanceFactory from '@objects/instance/InstanceFactory'

export default class Waddle {

    users: (GameUser | null)[]

    id!: number
    roomId!: number
    seats!: number
    game!: string

    constructor(data: any) {
        Object.assign(this, data)

        this.users = new Array(data.seats).fill(null)
    }

    get notFull() {
        return this.users.includes(null)
    }

    add(user: GameUser) {
        if (this.game === 'card' && !user.cards.hasCards) {
            return
        }

        const seat = this.users.indexOf(null)
        this.users[seat] = user

        user.waddle = this

        // Start game
        if (!this.users.includes(null)) {
            return this.start()
        }

        user.send('join_waddle', { waddle: this.id, seat, game: this.game })
        user.room?.send(user, 'update_waddle', { waddle: this.id, seat, username: user.username }, [])
    }

    remove(user: GameUser) {
        const seat = this.users.indexOf(user)
        this.users[seat] = null

        user.waddle = null

        user.room?.send(user, 'update_waddle', { waddle: this.id, seat, username: null }, [])
    }

    start() {
        const instance = InstanceFactory.createInstance(this)

        this.reset()
        instance.init()
    }

    reset() {
        for (const user of this.users.filter(Boolean)) {
            if (user) {
                this.remove(user)
            }
        }
    }

}
