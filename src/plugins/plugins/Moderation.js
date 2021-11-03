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
        let recipient = this.usersById[args.id]

        if (user.isModerator && recipient) {
            recipient.close()
        }
    }

    banPlayer(args, user) {

    }

}
