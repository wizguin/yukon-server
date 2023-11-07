import BaseInstance from '../BaseInstance'

import { hasProps, isInRange } from '@utils/validation'


export default class SledInstance extends BaseInstance {

    constructor(waddle) {
        super(waddle)

        this.id = 999

        this.coins = [20, 10, 5, 5]
    }

    addListeners(user) {
        super.addListeners(user)
    }

    removeListeners(user) {
        super.removeListeners(user)
    }

    start() {
        const users = this.users.map(user => {
            return {
                username: user.username,
                color: user.color,
                hand: user.hand
            }
        })

        this.send('start_game', { users: users })

        super.start()
    }

    sendMove(args, user) {
        if (!hasProps(args, 'move')) {
            return
        }

        if (!isInRange(args.move, 1, 5)) {
            return
        }

        if (args.move === 5) {
            return this.sendGameOver(user)
        }

        this.send('send_move', { id: this.getSeat(user), move: args.move }, user)
    }

    sendGameOver(user) {
        this.remove(user)
        user.updateCoins(this.coins.shift(), true)
    }

}
