import BaseCollection from '@database/BaseCollection'

import Database from '@database/Database'
import type User from '@objects/user/User'

import type { Ignore as PrismaIgnore } from '../../generated/prisma/client'

interface Ignore extends PrismaIgnore {
    ignore: {
        username: string
    }
}

export default class IgnoreCollection extends BaseCollection<Ignore> {

    constructor(user: User, records: Ignore[]) {
        super(user, records, 'ignoreId')
    }

    async add(ignoreId: number) {
        if (this.includes(ignoreId)) {
            return
        }

        try {
            this.collect(await Database.ignore.create({
                data: {
                    userId: this.user.id,
                    ignoreId
                },
                include: {
                    ignore: { select: { username: true } }
                }
            }))

        } catch (error) {
            console.error(error)
        }
    }

    async remove(ignoreId: number) {
        if (!this.includes(ignoreId)) {
            return
        }

        await Database.ignore.delete({
            where: {
                userId_ignoreId: {
                    userId: this.user.id,
                    ignoreId
                }
            }
        })

        super.remove(ignoreId)
    }

    toJSON() {
        return Array.from(this.values, ({ ignoreId, ignore }) => (
            { id: ignoreId, username: ignore.username }
        ))
    }

}
