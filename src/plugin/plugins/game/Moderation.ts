import GamePlugin from '@plugin/GamePlugin'


export default class Moderation extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'mute_player': this.mutePlayer,
            'kick_player': this.kickPlayer,
            'ban_player': this.banPlayer
        }
    }

    mutePlayer(args, user) {

    }

    kickPlayer(args, user) {
        if (!user.isModerator) {
            return
        }

        let recipient = this.usersById[args.id]

        if (recipient && recipient.rank < user.rank) {
            recipient.close()
        }
    }

    async banPlayer(args, user) {
        if (!user.isModerator) {
            return
        }

        let recipient = this.usersById[args.id]

        if (!recipient) {
            return
        }

        let recipientRank = await this.getRecipientRank(recipient, args.id)

        if (recipientRank < user.rank) {
            await this.applyBan(user, args.id)

            recipient.close()
        }
    }

    async applyBan(moderator, id, hours = 24, message = '') {
        let expires = Date.now() + (hours * 60 * 60 * 1000)

        let banCount = await this.db.getBanCount(id)
        // 5th ban is a permanent ban
        if (banCount >= 4) {
            this.db.users.update({ permaBan: true }, { where: { id: id }})
        }

        this.db.bans.create({ userId: id, expires: expires, moderatorId: moderator.data.id, message: message })
    }

    async getRecipientRank(recipient, id) {
        return (recipient)
            ? recipient.rank
            : (await this.db.getUserById(id)).rank
    }

}
