import PrismaCollection from '@database/PrismaCollection'

import type GameHandler from '../../handlers/GameHandler'
import PrismaDatabase from '@database/PrismaDatabase'
import type User from '@objects/user/User'

import type { Buddy as PrismaBuddy } from '../../generated/prisma/client'

interface Buddy extends PrismaBuddy {
    buddy: {
        username: string
    }
}

enum Status {
    Online = 'buddy_online',
    Offline = 'buddy_offline'
}

export default class BuddyCollection extends PrismaCollection<Buddy> {

    constructor(user: User, records: Buddy[]) {
        super(user, records, 'buddyId')
    }

    get usersById() {
        return (this.user.handler as GameHandler).usersById
    }

    async add(buddyId: number) {
        if (this.includes(buddyId)) {
            return
        }

        try {
            this.collect(await PrismaDatabase.buddy.create({
                data: {
                    userId: this.user.id,
                    buddyId
                },
                include: {
                    buddy: { select: { username: true } }
                }
            }))

        } catch (error) {
            console.error(error)
        }
    }

    async remove(buddyId: number) {
        if (!this.includes(buddyId)) {
            return
        }

        await PrismaDatabase.buddy.delete({
            where: {
                userId_buddyId: {
                    userId: this.user.id,
                    buddyId
                }
            }
        })

        super.remove(buddyId)
    }

    sendOnline() {
        this.sendStatus(Status.Online)
    }

    sendOffline() {
        this.sendStatus(Status.Offline)
    }

    sendStatus(status: Status) {
        for (const buddyId of this.keys) {
            const buddy = this.usersById[buddyId]

            if (buddy) {
                buddy.send(status, { id: this.user.id })
            }
        }
    }

    toJSON() {
        return Array.from(this.values, ({ buddyId, buddy }) => (
            {
                id: buddyId,
                username: buddy.username,
                online: buddyId in this.usersById
            }
        ))
    }

}
