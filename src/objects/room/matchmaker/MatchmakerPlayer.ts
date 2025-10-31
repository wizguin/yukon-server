import type { Action, Args } from '../../../server/Server'
import type GameUser from '@objects/user/GameUser'

export default class MatchmakerPlayer {

    user: GameUser
    tick: number

    constructor(user: GameUser, tick: number) {
        this.user = user
        this.tick = tick
    }

    send(action: Action, args: Args = {}) {
        this.user.send(action, args)
    }

}
