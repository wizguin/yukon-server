import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'
import Database from '@database/Database'

import { hasProps, isNumber } from '@utils/validation'
import { userIdExists } from '@utils/user'

export default class Mail extends GamePlugin {

    postcardCost = 10
    maxPostcards = 100
    responses = {
        InsufficientCoins: 0,
        FullInbox: 1,
        Success: 2
    }

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            send_mail: this.sendMail,
            read_mail: this.readMail,
            delete_mail: this.deleteMail,
            delete_mail_from: this.deleteMailFrom
        }
    }

    sendMail(args: Args, user: GameUser) {
        if (!hasProps(args, 'recipient', 'postcardId')) {
            return
        }
        if (!isNumber(args.recipient) || !isNumber(args.postcardId)) {
            return
        }

        // Insufficient coins
        if (user.coins < this.postcardCost) {
            return this.sendMailResponse(user, this.responses.InsufficientCoins)
        }

        const recipient = this.usersById[args.recipient]

        if (recipient) {
            this.sendMailOnline(user, recipient, args.postcardId)
        } else {
            this.sendMailOffline(user, args.recipient, args.postcardId)
        }
    }

    readMail(args: Args, user: GameUser) {
        user.postcards.readMail()
    }

    deleteMail(args: Args, user: GameUser) {
        if (!hasProps(args, 'id')) {
            return
        }
        if (!isNumber(args.id)) {
            return
        }

        user.postcards.remove(args.id)
    }

    deleteMailFrom(args: Args, user: GameUser) {
        if (!hasProps(args, 'senderId')) {
            return
        }
        // null for system mail
        if (!isNumber(args.senderId) && args.senderId !== null) {
            return
        }

        user.postcards.removeFrom(args.senderId)
    }

    async sendMailOnline(user: GameUser, recipient: GameUser, postcardId: number) {
        // Ignored
        if (recipient.ignores.includes(user.id)) {
            return this.sendMailResponse(user, this.responses.Success)
        }

        // Full inbox
        if (recipient.postcards.count >= this.maxPostcards) {
            return this.sendMailResponse(user, this.responses.FullInbox)
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
            return this.sendMailResponse(user, this.responses.Success)
        }

        // Full inbox
        if (await this.getPostcardsCount(recipientId) >= this.maxPostcards) {
            return this.sendMailResponse(user, this.responses.FullInbox)
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
        user.updateCoins(-this.postcardCost)
        this.sendMailResponse(user, this.responses.Success)
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
