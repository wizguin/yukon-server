import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

export default class Waddle extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            get_waddles: this.getWaddles,
            join_waddle: this.joinWaddle,
            leave_waddle: this.leaveWaddle
        }
    }

    getWaddles(args: Args, user: GameUser) {
        if (!user.room) {
            return
        }

        const waddles = Object.fromEntries(Object.values(user.room.waddles).map(waddle => {
            const users = waddle.users.map(user => user ? user.username : null)

            return [waddle.id, users]
        }))

        user.send('get_waddles', { waddles })
    }

    joinWaddle(args: Args, user: GameUser) {
        if (!user.room) {
            return
        }

        const waddle = user.room.waddles[args.waddle]

        if (!waddle) {
            return
        }

        if (waddle.notFull && !user.waddle) {
            waddle.add(user)
        }
    }

    leaveWaddle(args: Args, user: GameUser) {
        if (user.waddle) {
            user.waddle.remove(user)
        }
    }

}
