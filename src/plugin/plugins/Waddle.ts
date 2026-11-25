import Plugin from '@plugin/Plugin'

import type User from '@objects/user/User'

import { type } from 'arktype'

const JoinWaddle = type({
    waddle: 'number.integer'
})

export default class Waddle extends Plugin {

    events = {
        get_waddles: this.getWaddles,
        join_waddle: this.joinWaddle,
        leave_waddle: this.leaveWaddle
    }

    getWaddles(args: unknown, user: User) {
        if (!user.room) {
            return
        }

        const waddles = Object.fromEntries(Object.values(user.room.waddles).map(waddle => {
            const users = waddle.users.map(user => user ? user.username : null)

            return [waddle.id, users]
        }))

        user.send('get_waddles', { waddles })
    }

    joinWaddle(args: unknown, user: User) {
        const { waddle: waddleId } = JoinWaddle.assert(args)

        if (!user.room) {
            return
        }

        const waddle = user.room.waddles[waddleId]

        if (!waddle) {
            return
        }

        if (waddle.notFull && !user.waddle) {
            waddle.add(user)
        }
    }

    leaveWaddle(args: unknown, user: User) {
        if (user.waddle) {
            user.waddle.remove(user)
        }
    }

}
