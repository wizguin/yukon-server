import Plugin from '../Plugin'


export default class Buddy extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'buddy_request': this.buddyRequest,
            'buddy_accept': this.buddyAccept,
            'buddy_reject': this.buddyReject,
            'buddy_remove': this.buddyRemove,
            'buddy_find': this.buddyFind
        }
    }

    buddyRequest(args, user) {
        let recipient = this.usersById[args.id]

        // Send request to recipient if they are online
        if (recipient) {
            recipient.buddy.addRequest(user.data.id, user.data.username)
        }
    }

    buddyAccept(args, user) {
        if (user.buddy.includes(args.id)) return
        if (user.ignore.includes(args.id)) return
        if (!(user.buddy.requests.includes(args.id))) return

        // Remove request
        user.buddy.requests = user.buddy.requests.filter(item => item != args.id)

        // Add to recipient buddy list
        user.buddy.addBuddy(args.id, args.username)

        // Add to requester buddy list
        let requester = this.usersById[args.id]
        if (requester) {
            requester.buddy.addBuddy(user.data.id, user.data.username, true)
        }

        // Db queries
        this.db.buddies.create({ userId: user.data.id, buddyId: args.id })
        this.db.buddies.create({ userId: args.id, buddyId: user.data.id })
    }

    buddyReject(args, user) {
        // Remove request
        user.buddy.requests = user.buddy.requests.filter(item => item != args.id)
    }

    buddyRemove(args, user) {
        if (!user.buddy.includes(args.id)) return

        user.buddy.removeBuddy(args.id)

        let buddy = this.usersById[args.id]
        if (buddy) buddy.buddy.removeBuddy(user.data.id)

        this.db.buddies.destroy({ where: { userId: user.data.id, buddyId: args.id } })
        this.db.buddies.destroy({ where: { userId: args.id, buddyId: user.data.id } })
    }

    buddyFind(args, user) {
        if (!user.buddy.includes(args.id) || !(args.id in this.usersById)) {
            return
        }

        let buddy = this.usersById[args.id]

        if (!buddy.room) {
            return
        }

        let result = { find: buddy.room.id }

        if (buddy.room.isIgloo) {
            result.igloo = true
        } else if (buddy.room.game) {
            result.game = true
        }

        user.send('buddy_find', result)
    }

}
