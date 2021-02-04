import Plugin from '../Plugin'


export default class Buddy extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'buddy_request': this.buddyRequest,
            'buddy_accept': this.buddyAccept,
            'buddy_remove': this.buddyRemove,
            'buddy_find': this.buddyFind
        }
    }

    buddyRequest(args, user) {
        if (user.buddy.includes(args.id)) return
        if (!(args.id in this.usersById)) return

        let buddy = this.usersById[args.id]
        buddy.send('buddy_request', { id: user.data.id, username: user.data.username })
    }

    buddyAccept(args, user) {

    }

    buddyRemove(args, user) {

    }

    buddyFind(args, user) {

    }

}
