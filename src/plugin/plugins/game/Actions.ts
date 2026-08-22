import GamePlugin from '@plugin/GamePlugin'

import { X, Y } from '@utils/validation'
import type GameUser from '@objects/user/GameUser'

import { type } from 'arktype'

const SendFrame = type({
    frame: '1 <= number <= 26',
    'set?': 'boolean'
})

const Position = type({
    x: X,
    y: Y
})

export default class Actions extends GamePlugin {

    events = {
        send_position: this.sendPosition,
        send_frame: this.sendFrame,
        snowball: this.snowball
    }

    sendPosition(args: unknown, user: GameUser) {
        const { x, y } = Position.assert(args)

        user.x = x
        user.y = y
        user.frame = 1

        user.room?.send(user, 'send_position', { id: user.id, x, y })
    }

    sendFrame(args: unknown, user: GameUser) {
        const { set, frame } = SendFrame.assert(args)

        user.frame = set ? frame : 1

        user.room?.send(user, 'send_frame', { id: user.id, frame, set })
    }

    snowball(args: unknown, user: GameUser) {
        const { x, y } = Position.assert(args)

        user.room?.send(user, 'snowball', { id: user.id, x, y })
    }

}
