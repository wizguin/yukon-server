import Plugin from '@plugin/Plugin'

import type User from '@objects/user/User'

export default class Matchmaking extends Plugin {

    events = {
        join_matchmaking: this.joinMatchmaking,
        leave_matchmaking: this.leaveMatchmaking
    }

    joinMatchmaking(args: unknown, user: User) {
        if (!user.room?.matchmaker) {
            return
        }

        if (!user.room.matchmaker.includes(user)) {
            user.room.matchmaker.add(user)
        }
    }

    leaveMatchmaking(args: unknown, user: User) {
        if (!user.room?.matchmaker) {
            return
        }

        if (user.room.matchmaker.includes(user)) {
            user.room.matchmaker.remove(user)
        }
    }

}
