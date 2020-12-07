import Plugin from '../Plugin'


export default class Chat extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'send_message': this.sendMessage
        }
    }

    sendMessage(args, user) {
        // Todo: message verification
        user.room.send(user, 'send_message', { id: user.data.id, message: args.message })
    }

}
