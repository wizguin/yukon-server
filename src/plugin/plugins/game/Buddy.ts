import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'
import Igloo from '@objects/room/Igloo'
import Database from '@database/Database'

import { getUsername } from '@utils/user'
import { hasProps } from '@utils/validation'

export default class Buddy extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            buddy_request: this.buddyRequest,
            buddy_accept: this.buddyAccept,
            buddy_reject: this.buddyReject,
            buddy_remove: this.buddyRemove,
            buddy_find: this.buddyFind
        }
    }

    buddyRequest(args: Args, user: GameUser) {
        const recipient = this.usersById[args.id]

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

    async buddyAccept(args: Args, user: GameUser) {
        if (!hasProps(args, 'id')) {
            return
        }

        if (!user.buddyRequests.includes(args.id)) {
            return
        }

        if (user.buddies.includes(args.id)) {
            return
        }

        user.clearBuddyRequest(args.id)

        const requester = this.usersById[args.id]
        let username: string

        if (requester) {
            username = requester.username
            requester.addBuddy(user.id, user.username, true)

        } else {
            username = await getUsername(args.id)

            await Database.buddy.create({
                data: {
                    userId: args.id,
                    buddyId: user.id
                }
            })
        }

        user.addBuddy(args.id, username)
    }

    buddyReject(args: Args, user: GameUser) {
        user.buddyRequests = user.buddyRequests.filter(item => item != args.id)
    }

    async buddyRemove(args: Args, user: GameUser) {
        if (!user.buddies.includes(args.id)) {
            return
        }

        user.removeBuddy(args.id)

        const buddy = this.usersById[args.id]

        if (buddy) {
            buddy.removeBuddy(user.id)
        } else {

            await Database.buddy.delete({
                where: {
                    userId_buddyId: {
                        userId: args.id,
                        buddyId: user.id
                    }
                }
            })
        }
    }

    buddyFind(args: Args, user: GameUser) {
        if (!user.buddies.includes(args.id) || !(args.id in this.usersById)) {
            return
        }

        const buddy = this.usersById[args.id]

        if (!buddy.room) {
            return
        }

        const result: Record<string, any> = { find: buddy.room.id }

        if (buddy.room instanceof Igloo) {
            result.igloo = true
        } else if (buddy.room.game) {
            result.game = true
        }

        user.send('buddy_find', result)
    }

}
