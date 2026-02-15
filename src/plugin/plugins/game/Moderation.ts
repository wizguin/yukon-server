import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'
import PrismaDatabase from '@database/PrismaDatabase'

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

    async applyBan(moderator: GameUser, userId: number, hours = 24, message = '') {
        const expires = new Date(Date.now() + hours * 60 * 60 * 1000)

        const banCount = await PrismaDatabase.ban.count({
            where: { userId }
        })

        // 5th ban is a permanent ban
        if (banCount >= 4) {
            await PrismaDatabase.user.update({
                where: {
                    id: userId
                },
                data: {
                    permaBan: true
                }
            })
        }

        await PrismaDatabase.ban.create({
            data: {
                userId,
                expires,
                moderatorId: moderator.id,
                message
            }
        })
    }

    async getRecipientRank(recipient: GameUser, id: number) {
        return recipient
            ? recipient.rank
            : (await this.db.getUserById(id)).rank
    }

}
