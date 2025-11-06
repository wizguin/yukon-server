import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

export default class Moderation extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            mute_player: this.mutePlayer,
            kick_player: this.kickPlayer,
            ban_player: this.banPlayer
        }
    }

    mutePlayer(_args: Args, _user: GameUser) {

    }

    kickPlayer(args: Args, user: GameUser) {
        if (!user.isModerator) {
            return
        }

        const recipient = this.usersById[args.id]

        if (recipient && recipient.rank < user.rank) {
            recipient.close()
        }
    }

    async banPlayer(args: Args, user: GameUser) {
        if (!user.isModerator) {
            return
        }

        const recipient = this.usersById[args.id]

        if (!recipient) {
            return
        }

        const recipientRank = await this.getRecipientRank(recipient, args.id)

        if (recipientRank < user.rank) {
            await this.applyBan(user, args.id)

            recipient.close()
        }
    }

    async applyBan(moderator: GameUser, id: number, hours = 24, message = '') {
        const expires = Date.now() + hours * 60 * 60 * 1000

        const banCount = await this.db.getBanCount(id)
        // 5th ban is a permanent ban
        if (banCount >= 4) {
            this.db.users.update({ permaBan: true }, { where: { id } })
        }

        this.db.bans.create({ userId: id, expires, moderatorId: moderator.id, message })
    }

    async getRecipientRank(recipient: GameUser, id: number) {
        return recipient
            ? recipient.rank
            : (await this.db.getUserById(id)).rank
    }

}
