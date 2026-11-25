import GamePlugin from '@plugin/GamePlugin'

import Database from '@database/Database'
import { getUsername } from '@utils/user'
import Igloo from '@objects/room/Igloo'
import type User from '@objects/user/User'

import { type } from 'arktype'

const BuddyId = type({
    id: 'number.integer'
})

export default class Buddy extends GamePlugin {

    events = {
        buddy_request: this.buddyRequest,
        buddy_accept: this.buddyAccept,
        buddy_reject: this.buddyReject,
        buddy_remove: this.buddyRemove,
        buddy_find: this.buddyFind
    }

    buddyRequest(args: unknown, user: User) {
        const { id } = BuddyId.assert(args)

        const recipient = this.usersById[id]

        if (!recipient) {
            return
        }

        if (recipient.id === user.id) {
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

    async buddyAccept(args: unknown, user: User) {
        const { id } = BuddyId.assert(args)

        if (!user.buddyRequests.includes(id)) {
            return
        }

        if (user.buddies.includes(id)) {
            return
        }

        user.clearBuddyRequest(id)

        const requester = this.usersById[id]
        let username: string

        if (requester) {
            username = requester.username
            requester.addBuddy(user.id, user.username, true)

        } else {
            username = await getUsername(id)

            await Database.buddy.create({
                data: {
                    userId: id,
                    buddyId: user.id
                }
            })
        }

        user.addBuddy(id, username)
    }

    buddyReject(args: unknown, user: User) {
        const { id } = BuddyId.assert(args)

        user.buddyRequests = user.buddyRequests.filter(item => item !== id)
    }

    async buddyRemove(args: unknown, user: User) {
        const { id } = BuddyId.assert(args)

        if (!user.buddies.includes(id)) {
            return
        }

        await user.removeBuddy(id)

        const buddy = this.usersById[id]

        if (buddy) {
            await buddy.removeBuddy(user.id)

        } else {
            await Database.buddy.delete({
                where: {
                    userId_buddyId: {
                        userId: id,
                        buddyId: user.id
                    }
                }
            })
        }
    }

    buddyFind(args: unknown, user: User) {
        const { id } = BuddyId.assert(args)

        if (!user.buddies.includes(id) || !(id in this.usersById)) {
            return
        }

        const buddy = this.usersById[id]

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
