import GamePlugin from '@plugin/GamePlugin'

import Database from '@database/Database'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import { type } from 'arktype'

const Id = type({
    id: 'number'
})

export default class Moderation extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            mute_player: this.mutePlayer,
            kick_player: this.kickPlayer,
            ban_player: this.banPlayer
        }
    }

    mutePlayer(args: unknown, user: GameUser) {

    }

    kickPlayer(args: unknown, user: GameUser) {
        const { id } = Id.assert(args)

        if (!user.isModerator) {
            return
        }

        const recipient = this.usersById[id]

        if (recipient && recipient.rank < user.rank) {
            recipient.close()
        }
    }

    async banPlayer(args: unknown, user: GameUser) {
        const { id } = Id.assert(args)

        if (!user.isModerator) {
            return
        }

        const recipient = this.usersById[id]

        const recipientRank = recipient?.rank ?? await this.getRank(id)

        if (recipientRank === null || recipientRank >= user.rank) {
            return
        }

        await this.applyBan(user, id)

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
