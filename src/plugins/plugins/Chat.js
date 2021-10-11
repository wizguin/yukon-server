import Plugin from '../Plugin'


export default class Chat extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'send_message': this.sendMessage,
            'send_safe': this.sendSafe,
            'send_emote': this.sendEmote
        }
    }

    sendMessage(args, user) {
        // Todo: message verification
        user.room.send(user, 'send_message', { id: user.data.id, message: args.message }, [user], true)
    }

    sendSafe(args, user) {
        user.room.send(user, 'send_safe', { id: user.data.id, safe: args.safe }, [user], true)
    }

    sendEmote(args, user) {
        user.room.send(user, 'send_emote', { id: user.data.id, emote: args.emote }, [user], true)
    }

}
