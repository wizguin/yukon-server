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
        this.sendRoom(user, 'send_message', { id: user.data.id, message: args.message })
    }

}
