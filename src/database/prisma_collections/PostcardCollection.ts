import PrismaCollection from '@database/PrismaCollection'

import PrismaDatabase from '@database/PrismaDatabase'
import type User from '@objects/user/User'

import type { Postcard as PrismaPostcard } from '../../generated/prisma/client'

interface Postcard extends PrismaPostcard {
    sender: {
        username: string
    } | null
}

const systemName = 'sys'

export default class PostcardCollection extends PrismaCollection<Postcard> {

    constructor(user: User, records: Postcard[]) {
        super(user, records, 'id')
    }

    async add(senderId: number, postcardId: number, details?: string) {
        try {
            const postcard = await PrismaDatabase.postcard.create({
                data: {
                    userId: this.user.id,
                    senderId,
                    postcardId,
                    details
                },
                include: {
                    sender: { select: { username: true } }
                }
            })

            this.collect(postcard)

            return this.formatPostcard(postcard)

        } catch (error) {
            console.error(error)

            return false
        }
    }

    async remove(postcardId: number) {
        if (!this.includes(postcardId)) {
            return
        }

        try {
            await PrismaDatabase.postcard.delete({
                where: {
                    id: postcardId
                }
            })

            super.remove(postcardId)

        } catch (error) {
            console.error(error)
        }
    }

    async removeFrom(senderId: number) {
        try {
            await PrismaDatabase.postcard.deleteMany({
                where: {
                    senderId
                }
            })

            for (const [key, postcard] of this.collection) {
                if (postcard.senderId === senderId) {
                    super.remove(key)
                }
            }

        } catch (error) {
            console.error(error)
        }
    }

    async readMail() {
        for (const postcard of this.values) {
            if (postcard.hasRead) {
                continue
            }

            try {
                await PrismaDatabase.postcard.update({
                    where: {
                        id: postcard.id
                    },
                    data: {
                        hasRead: true
                    }
                })

                postcard.hasRead = true

            } catch (error) {
                console.error(error)
            }
        }
    }

    formatPostcard({ id, senderId, postcardId, sendDate, details, hasRead, sender }: Postcard) {
        return {
            id,
            senderId,
            postcardId,
            sendDate,
            details,
            hasRead,
            senderName: sender !== null ? sender.username : systemName
        }
    }

    toJSON() {
        return Array.from(this.values, postcard => this.formatPostcard(postcard))
    }

}
