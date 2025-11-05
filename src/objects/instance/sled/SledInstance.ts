import BaseInstance from '../BaseInstance'

import GameUser from '@objects/user/GameUser'

import { hasProps, isInRange } from '@utils/validation'

export default class SledInstance extends BaseInstance {

    coins = [20, 10, 5, 5]

    constructor(waddle: any) {
        super(waddle, 999)
    }

    addListeners(user: GameUser) {
        super.addListeners(user)
    }

    removeListeners(user: GameUser) {
        super.removeListeners(user)
    }

    start() {
        const users = this.users.filter(user => user instanceof GameUser).map(user => ({
            username: user.username,
            color: user.color,
            hand: user.hand
        }))

        this.send('start_game', { users })

        super.start()
    }

    sendMove(args: any, user: GameUser) {
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

    sendGameOver(user: GameUser) {
        this.remove(user)
        user.updateCoins(this.coins.shift() || 0, true)
    }

}
