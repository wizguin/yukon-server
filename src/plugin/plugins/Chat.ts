import GamePlugin from '@plugin/GamePlugin'

import type GameHandler from '../../handlers/GameHandler'
import type User from '@objects/user/User'

import { type } from 'arktype'

type CommandHandler = (args: string[], user: User) => void | Promise<void>

const SendMessage = type({
    message: 'string'
})

const SendSafe = type({
    safe: 'number.integer'
})

const SendEmote = type({
    emote: 'number.integer'
})

const SendJoke = type({
    joke: 'number.integer'
})

const SendTour = type({
    roomId: 'number.integer'
})

const Integer = type('string.integer.parse')

const messageRegex = /[^ -~]/i
const maxMessageLength = 48

export default class Chat extends GamePlugin {

    events = {
        send_message: this.sendMessage,
        send_safe: this.sendSafe,
        send_emote: this.sendEmote,
        send_joke: this.sendJoke,
        send_tour: this.sendTour
    }

    commands: Record<string, CommandHandler> = {
        ai: this.addItem,
        af: this.addFurniture,
        ac: this.addCoins,
        jr: this.joinRoom,
        id: this.id,
        users: this.userPopulation
    }

    constructor(handler: GameHandler) {
        super(handler)

        this.bindCommands()
    }

    async sendMessage(args: unknown, user: User) {
        const { message: rawMessage } = SendMessage.assert(args)

        if (messageRegex.test(rawMessage)) {
            return
        }

        // Remove extra whitespace
        const message = rawMessage.replace(/  +/g, ' ').trim()

        if (message.length < 1 || message.length > maxMessageLength) {
            return
        }

        if (message.startsWith('!') && await this.processCommand(message, user)) {
            return
        }

        if (user.room) {
            user.room.send(user, 'send_message', { id: user.id, message }, [user], true)
        }
    }

    sendSafe(args: unknown, user: User) {
        const { safe } = SendSafe.assert(args)

        if (user.room) {
            user.room.send(user, 'send_safe', { id: user.id, safe }, [user], true)
        }
    }

    sendEmote(args: unknown, user: User) {
        const { emote } = SendEmote.assert(args)

        if (user.room) {
            user.room.send(user, 'send_emote', { id: user.id, emote }, [user], true)
        }
    }

    sendJoke(args: unknown, user: User) {
        const { joke } = SendJoke.assert(args)

        if (user.room) {
            user.room.send(user, 'send_joke', { id: user.id, joke }, [user], true)
        }
    }

    sendTour(args: unknown, user: User) {
        const { roomId } = SendTour.assert(args)

        if (roomId !== user.room?.id) {
            return
        }

        if (user.room) {
            user.room.send(user, 'send_tour', { id: user.id, roomId }, [user], true)
        }
    }

    bindCommands() {
        for (const command in this.commands) {
            this.commands[command] = this.commands[command].bind(this)
        }
    }

    async processCommand(message: string, user: User) {
        message = message.substring(1)

        const args = message.split(' ')
        const command = args.shift()?.toLowerCase()

        if (command && command in this.commands) {
            await this.commands[command](args, user)
            return true
        }

        return false
    }

    async addItem(args: string[], user: User) {
        if (!user.isModerator) {
            return
        }

        const itemId = Integer.assert(args[0])

        await user.addItem(itemId)
    }

    async addFurniture(args: string[], user: User) {
        if (!user.isModerator) {
            return
        }

        const furnitureId = Integer.assert(args[0])

        await user.addFurniture(furnitureId)
    }

    async addCoins(args: string[], user: User) {
        if (!user.isModerator) {
            return
        }

        const coins = Integer.assert(args[0])

        await user.addCoins(coins, true)
    }

    joinRoom([room]: string[], user: User) {
        if (!user.isModerator) {
            return
        }

        if (!room) {
            return
        }

        if (Number.isInteger(Number(room))) {
            user.joinRoom(this.rooms[Number(room)])
            return
        }

        const foundRoom = Object.values(this.rooms).find(
            ({ name }) => name === room.toLowerCase()
        )

        if (foundRoom) {
            user.joinRoom(foundRoom)
        }
    }

    id(args: string[], user: User) {
        user.send('error', { error: `Your ID: ${user.id}` })
    }

    userPopulation(args: string[], user: User) {
        // @ts-expect-error temp
        user.send('error', { error: `Users online: ${this.handler.population}` })
    }

}
