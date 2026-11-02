import GamePlugin from '@plugin/GamePlugin'

import { InboxFullError, InsufficientCoinsError } from '@utils/error'
import Database from '@database/Database'
import type GameUser from '@objects/user/GameUser'
import { userIdExists } from '@utils/user'

import { type } from 'arktype'

const SendMail = type({
    recipient: 'number.integer',
    postcardId: 'number.integer'
})

const DeleteMail = type({
    id: 'number'
})

const DeleteMailFrom = type({
    senderId: 'number | null'
})

const postcardCost = 10
const maxPostcards = 100
const responses = {
    InsufficientCoins: 0,
    FullInbox: 1,
    Success: 2
}

export default class Mail extends GamePlugin {

    events = {
        send_mail: this.sendMail,
        read_mail: this.readMail,
        delete_mail: this.deleteMail,
        delete_mail_from: this.deleteMailFrom
    }

    async sendMail(args: unknown, user: GameUser) {
        const { recipient: recipientId, postcardId } = SendMail.assert(args)

        const recipient = this.usersById[recipientId]

        try {
            if (recipient) {
                await this.sendMailOnline(user, recipient, postcardId)
            } else {
                await this.sendMailOffline(user, recipientId, postcardId)
            }

        } catch (error) {
            if (error instanceof InboxFullError) {
                this.sendMailResponse(user, responses.FullInbox)
                return
            }

            if (error instanceof InsufficientCoinsError) {
                this.sendMailResponse(user, responses.InsufficientCoins)
                return
            }

            throw error
        }
    }

    async sendMailOnline(sender: GameUser, recipient: GameUser, postcardId: number) {
        if (recipient.ignores.includes(sender.id)) {
            this.sendMailResponse(sender, responses.Success)
            return
        }

        await this.deliverMail(sender, recipient.id, postcardId)
    }

    async sendMailOffline(sender: GameUser, recipientId: number, postcardId: number) {
        if (!await userIdExists(recipientId)) {
            return
        }

        if (await this.isIgnored(recipientId, sender.id)) {
            this.sendMailResponse(sender, responses.Success)
            return
        }

        await this.deliverMail(sender, recipientId, postcardId)
    }

    async deliverMail(sender: GameUser, recipientId: number, postcardId: number) {
        const postcard = await sender.purchase(postcardCost, async tx => {
            const count = await tx.postcard.count({ where: { userId: recipientId } })

            if (count >= maxPostcards) {
                throw new InboxFullError()
            }

            return tx.postcard.create({
                data: {
                    userId: recipientId,
                    senderId: sender.id,
                    postcardId
                },
                include: {
                    sender: { select: { username: true } }
                }
            })
        })

        this.usersById[recipientId]?.receiveMail(postcard)

        this.sendMailResponse(sender, responses.Success)
    }

    async isIgnored(userId: number, ignoreId: number) {
        const ignore = await Database.ignore.findUnique({
            where: {
                userId_ignoreId: {
                    userId,
                    ignoreId
                }
            }
        })

        return ignore !== null
    }

    /**
     * Send response to the sending user.
     */
    private sendMailResponse(sender: GameUser, response: number) {
        sender.send('send_mail', { coins: sender.coins, response })
    }

    readMail(args: unknown, user: GameUser) {
        user.postcards.readMail()
    }

    deleteMail(args: unknown, user: GameUser) {
        const { id } = DeleteMail.assert(args)

        user.postcards.remove(id)
    }

    deleteMailFrom(args: unknown, user: GameUser) {
        const { senderId } = DeleteMailFrom.assert(args)

        user.postcards.removeFrom(senderId)
    }

}
