import Plugin from '@plugin/Plugin'


export default class Moderation extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)

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

        if (recipient && recipient.data.rank < user.data.rank) {
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

        if (recipientRank < user.data.rank) {
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
            ? recipient.data.rank
            : (await this.db.getUserById(id)).rank
    }

}
