import BaseInstance from '../BaseInstance'


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
        this.send('send_move', { id: args.id, x: args.x, y: args.y }, user)
    }

}
