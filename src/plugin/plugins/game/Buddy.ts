import GamePlugin from '@plugin/GamePlugin'

import { hasProps } from '@utils/validation'


export default class Buddy extends GamePlugin {

    constructor(handler) {
        super(handler)

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

        if (!recipient) {
            return
        }

        if (recipient.id == user.id) {
            return
        }

        if (recipient.buddyRequests.includes(user.id)) {
            return
        }

        if (recipient.buddies.includes(user.id)) {
            return
        }

        if (recipient.ignores.includes(user.id)) {
            return
        }

        recipient.buddyRequests.push(user.id)
        recipient.send('buddy_request', { id: user.id, username: user.username })
    }

    async buddyAccept(args, user) {
        if (!hasProps(args, 'id')) {
            return
        }

        if (!(user.buddyRequests.includes(args.id))) {
            return
        }

        if (user.buddies.includes(args.id)) {
            return
        }

        user.clearBuddyRequest(args.id)

        let requester = this.usersById[args.id]
        let username

        if (requester) {
            username = requester.username
            requester.addBuddy(user.id, user.username, true)

        } else {
            username = await this.db.getUsername(args.id)
            this.db.buddies.create({ userId: args.id, buddyId: user.id })
        }

        user.addBuddy(args.id, username)
    }

    buddyReject(args, user) {
        user.buddyRequests = user.buddyRequests.filter(item => item != args.id)
    }

    buddyRemove(args, user) {
        if (!user.buddies.includes(args.id)) {
            return
        }

        user.removeBuddy(args.id)

        let buddy = this.usersById[args.id]

        if (buddy) {
            buddy.removeBuddy(user.id)
        } else {
            this.db.buddies.destroy({ where: { userId: args.id, buddyId: user.id } })
        }
    }

    buddyFind(args, user) {
        if (!user.buddies.includes(args.id) || !(args.id in this.usersById)) {
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
