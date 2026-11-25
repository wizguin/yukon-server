import type { Action, Args } from '../../../server/Server'
import type User from '@objects/user/User'

export default class MatchmakerPlayer {

    user: User
    tick: number

    constructor(user: User, tick: number) {
        this.user = user
        this.tick = tick
    }

    send(action: Action, args: Args = {}) {
        this.user.send(action, args)
    }

}
