import GamePlugin from '@plugin/GamePlugin'

import { hasProps, isNumber } from '@utils/validation'


export default class Puck extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'get_puck': this.getPuck,
            'move_puck': this.movePuck
        }

        this.rinkRoomId = 802

        this.puckX = 0
        this.puckY = 0
    }

    getPuck(args, user) {
        if (user.room.id !== this.rinkRoomId) return

        user.send('get_puck', { x: this.puckX, y: this.puckY })
    }

    movePuck(args, user) {
        if (user.room.id !== this.rinkRoomId) return

        if (!hasProps(args, 'x', 'y', 'speedX', 'speedY')) return

        if (!isNumber(args.x)) return
        if (!isNumber(args.y)) return
        if (!isNumber(args.speedX)) return
        if (!isNumber(args.speedY)) return

        this.puckX = args.x
        this.puckY = args.y

        user.room.send(user, 'move_puck', { x: args.x, y: args.y, speedX: args.speedX, speedY: args.speedY })
    }

}
