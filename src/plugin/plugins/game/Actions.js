import GamePlugin from '@plugin/GamePlugin'

import { hasProps, isInRange } from '@utils/validation'


export default class Actions extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'send_position': this.sendPosition,
            'send_frame': this.sendFrame,
            'snowball': this.snowball
        }
    }

    sendPosition(args, user) {
        if (!hasProps(args, 'x', 'y')) {
            return
        }

        if (!isInRange(args.x, 0, 1520)) {
            return
        }

        if (!isInRange(args.y, 0, 960)) {
            return
        }

        user.x = args.x
        user.y = args.y
        user.frame = 1

        user.room.send(user, 'send_position', { id: user.id, x: args.x, y: args.y })
    }

    sendFrame(args, user) {
        if (!hasProps(args, 'frame')) {
            return
        }

        if (!isInRange(args.frame, 1, 26)) {
            return
        }

        if (args.set) {
            user.frame = args.frame
        } else {
            user.frame = 1
        }

        user.room.send(user, 'send_frame', { id: user.id, frame: args.frame, set: args.set })
    }

    snowball(args, user) {
        if (!hasProps(args, 'x', 'y')) {
            return
        }

        if (!isInRange(args.x, 0, 1520)) {
            return
        }

        if (!isInRange(args.y, 0, 960)) {
            return
        }

        user.room.send(user, 'snowball', { id: user.id, x: args.x, y: args.y })
    }

}
