import Plugin from '../Plugin'


export default class Actions extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'send_position': this.sendPosition,
            'send_frame': this.sendFrame,
            'snowball': this.snowball
        }
    }

    sendPosition(args, user) {
        user.x = args.x
        user.y = args.y
        user.frame = 1

        user.room.send(user, 'send_position', { id: user.data.id, x: args.x, y: args.y })
    }

    sendFrame(args, user) {
        if (args.set) {
            user.frame = args.frame
        } else {
            user.frame = 1
        }

        user.room.send(user, 'send_frame', { id: user.data.id, frame: args.frame, set: args.set })
    }

    snowball(args, user) {
        user.room.send(user, 'snowball', { id: user.data.id, x: args.x, y: args.y })
    }

}
