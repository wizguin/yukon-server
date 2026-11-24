import GamePlugin from '@plugin/GamePlugin'

import type GameUser from '@objects/user/GameUser'

import { type } from 'arktype'

const MovePuck = type({
    x: 'number.integer',
    y: 'number.integer',
    speedX: 'number.integer',
    speedY: 'number.integer'
})

const rinkRoomId = 802

export default class Puck extends GamePlugin {

    puckX = 0
    puckY = 0

    events = {
        get_puck: this.getPuck,
        move_puck: this.movePuck
    }

    getPuck(args: unknown, user: GameUser) {
        if (user.room?.id !== rinkRoomId) {
            return
        }

        user.send('get_puck', { x: this.puckX, y: this.puckY })
    }

    movePuck(args: unknown, user: GameUser) {
        if (user.room?.id !== rinkRoomId) {
            return
        }

        const { x, y, speedX, speedY } = MovePuck.assert(args)

        this.puckX = x
        this.puckY = y

        user.room.send(user, 'move_puck', { x, y, speedX, speedY })
    }

}
