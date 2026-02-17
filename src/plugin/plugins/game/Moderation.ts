import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'
import Database from '@database/Database'

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

        const recipientRank = recipient?.rank ?? await this.getRank(args.id)

        if (recipientRank === null || recipientRank >= user.rank) {
            return
        }

        await this.applyBan(user, args.id)

        if (recipient) {
            recipient.close()
        }
    }

    async applyBan(moderator: GameUser, userId: number, hours = 24, message = '') {
        const expires = new Date(Date.now() + hours * 60 * 60 * 1000)

        const banCount = await Database.ban.count({
            where: { userId }
        })

        // 5th ban is a permanent ban
        if (banCount >= 4) {
            await Database.user.update({
                where: {
                    id: userId
                },
                data: {
                    permaBan: true
                }
            })
        }

        await Database.ban.create({
            data: {
                userId,
                expires,
                moderatorId: moderator.id,
                message
            }
        })
    }

    async getRank(userId: number) {
        const user = await Database.user.findUnique({
            where: {
                id: userId
            },
            select: {
                rank: true
            }
        })

        return user?.rank ?? null
    }

}
