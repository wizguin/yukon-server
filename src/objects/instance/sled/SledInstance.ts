import BaseInstance, { type InstanceUsers } from '../BaseInstance'

import User from '@objects/user/User'

import { type } from 'arktype'

const SendMove = type({
    move: '1 <= number.integer <= 5'
})

export default class SledInstance extends BaseInstance {

    coins = [20, 10, 5, 5]

    constructor(users: InstanceUsers) {
        super(users, 999)
    }

    addListeners(user: User) {
        super.addListeners(user)
    }

    removeListeners(user: User) {
        super.removeListeners(user)
    }

    start() {
        const users = this.users.filter(user => user instanceof User).map(user => ({
            username: user.username,
            color: user.color,
            hand: user.hand
        }))

        this.send('start_game', { users })

        super.start()
    }

    sendMove(args: unknown, user: User) {
        const { move } = SendMove.assert(args)

        if (move === 5) {
            return this.sendGameOver(user)
        }

        this.send('send_move', { id: this.getSeat(user), move }, user)
    }

    async sendGameOver(user: User) {
        this.remove(user)
        await user.addCoins(this.coins.shift() || 0, true)
    }

}
