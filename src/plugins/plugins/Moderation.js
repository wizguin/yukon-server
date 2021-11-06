import Plugin from '../Plugin'


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
        let recipientRank = await this.getRecipientRank(recipient, args.id)

        if (recipientRank < user.data.rank) {
            this.applyBan(user, args.id)
        }

        if (recipient) {
            recipient.close()
        }
    }

    applyBan(moderator, id, hours = 24, message = '') {
        let expires = Date.now() + (hours * 60 * 60 * 1000)

        this.db.bans.create({ userId: id, expires: expires, moderatorId: moderator.data.id, message: message })
    }

    async getRecipientRank(recipient, id) {
        return (recipient)
            ? recipient.data.rank
            : (await this.db.getUserById(id)).rank
    }

}
