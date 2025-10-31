import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

export default class Matchmaking extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            join_matchmaking: this.joinMatchmaking,
            leave_matchmaking: this.leaveMatchmaking
        }
    }

    joinMatchmaking(args: Args, user: GameUser) {
        if (!user.room?.matchmaker) {
            return
        }

        if (!user.room.matchmaker.includes(user)) {
            user.room.matchmaker.add(user)
        }
    }

    leaveMatchmaking(args: Args, user: GameUser) {
        if (!user.room?.matchmaker) {
            return
        }

        if (user.room.matchmaker.includes(user)) {
            user.room.matchmaker.remove(user)
        }
    }

}
