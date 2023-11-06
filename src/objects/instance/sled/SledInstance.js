import BaseInstance from '../BaseInstance'

import { hasProps, isInRange } from '@utils/validation'


export default class SledInstance extends BaseInstance {

    constructor(waddle) {
        super(waddle)

        this.id = 999
    }

    addListeners(user) {
        //user.events.on('send_move', this.handleSendMove)

        super.addListeners(user)
    }

    removeListeners(user) {
        //user.events.off('send_move', this.handleSendMove)

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

    // Uncomment event in addListeners when updating all minigame events to new system
    sendMove(args, user) {
        if (!hasProps(args, 'move')) {
            return
        }

        if (!isInRange(args.move, 1, 4)) {
            return
        }

        this.send('send_move', { id: this.getSeat(user), move: args.move }, user)
    }

}
