import GamePlugin from '@plugin/GamePlugin'

import Database from '@database/Database'
import type GameUser from '@objects/user/GameUser'
import { userIdExists } from '@utils/user'

import { type } from 'arktype'

const SendMail = type({
    recipient: 'number',
    postcardId: 'number'
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

    sendMail(args: unknown, user: GameUser) {
        const { recipient: recipientId, postcardId } = SendMail.assert(args)

        if (user.coins < postcardCost) {
            return this.sendMailResponse(user, responses.InsufficientCoins)
        }

        const recipient = this.usersById[recipientId]

        if (recipient) {
            this.sendMailOnline(user, recipient, postcardId)
        } else {
            this.sendMailOffline(user, recipientId, postcardId)
        }
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

    async sendMailOnline(user: GameUser, recipient: GameUser, postcardId: number) {
        // Ignored
        if (recipient.ignores.includes(user.id)) {
            return this.sendMailResponse(user, responses.Success)
        }

        // Full inbox
        if (recipient.postcards.count >= maxPostcards) {
            return this.sendMailResponse(user, responses.FullInbox)
        }

        // Add postcard
        const postcard = await recipient.postcards.add(postcardId, user.id)
        if (!postcard) {
            return
        }

        recipient.send('receive_mail', postcard)

        this.removeCoins(user)
    }

    async sendMailOffline(user: GameUser, recipientId: number, postcardId: number) {
        if (!await userIdExists(recipientId)) {
            return
        }

        // Ignored
        if (await this.isIgnored(recipientId, user.id)) {
            return this.sendMailResponse(user, responses.Success)
        }

        // Full inbox
        if (await this.getPostcardsCount(recipientId) >= maxPostcards) {
            return this.sendMailResponse(user, responses.FullInbox)
        }

        // Add postcard
        await Database.postcard.create({
            data: {
                userId: recipientId,
                senderId: user.id,
                postcardId
            }
        })

        this.removeCoins(user)
    }

    removeCoins(user: GameUser) {
        user.updateCoins(-postcardCost)
        this.sendMailResponse(user, responses.Success)
    }

    /**
     * Send response to the sending user.
     */
    sendMailResponse(user: GameUser, response: number) {
        user.send('send_mail', { coins: user.coins, response })
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

    getPostcardsCount(userId: number) {
        return Database.postcard.count({
            where: { userId }
        })
    }

}
