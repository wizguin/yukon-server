import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import { hasProps, isNumber } from '@utils/validation'

export default class Puck extends GamePlugin {

    rinkRoomId = 802
    puckX = 0
    puckY = 0

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            get_puck: this.getPuck,
            move_puck: this.movePuck
        }
    }

    getPuck(args: Args, user: GameUser) {
        if (user.room?.id !== this.rinkRoomId) {
            return
        }

        user.send('get_puck', { x: this.puckX, y: this.puckY })
    }

    movePuck(args: Args, user: GameUser) {
        if (user.room?.id !== this.rinkRoomId) {
            return
        }

        if (!hasProps(args, 'x', 'y', 'speedX', 'speedY')) {
            return
        }

        if (!isNumber(args.x)) {
            return
        }
        if (!isNumber(args.y)) {
            return
        }
        if (!isNumber(args.speedX)) {
            return
        }
        if (!isNumber(args.speedY)) {
            return
        }

        this.puckX = args.x
        this.puckY = args.y

        user.room.send(user, 'move_puck', { x: args.x, y: args.y, speedX: args.speedX, speedY: args.speedY })
    }

}
