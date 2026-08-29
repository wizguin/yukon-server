import GamePlugin from '@plugin/GamePlugin'

import type GameUser from '@objects/user/GameUser'

export default class Matchmaking extends GamePlugin {

    events = {
        join_matchmaking: this.joinMatchmaking,
        leave_matchmaking: this.leaveMatchmaking
    }

    joinMatchmaking(args: unknown, user: GameUser) {
        if (!user.room?.matchmaker) {
            return
        }

        if (!user.room.matchmaker.includes(user)) {
            user.room.matchmaker.add(user)
        }
    }

    leaveMatchmaking(args: unknown, user: GameUser) {
        if (!user.room?.matchmaker) {
            return
        }

        if (user.room.matchmaker.includes(user)) {
            user.room.matchmaker.remove(user)
        }
    }

}
