import GamePlugin from '@plugin/GamePlugin'

import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import { type } from 'arktype'

type CommandHandler = (args: string[], user: GameUser) => void

const SendMessage = type({
    message: 'string'
})

const SendSafe = type({
    safe: 'number'
})

const SendEmote = type({
    emote: 'number'
})

const SendJoke = type({
    joke: 'number'
})

const SendTour = type({
    roomId: 'number'
})

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

    // Events

    sendMessage(args: unknown, user: GameUser) {
        const { message: rawMessage } = SendMessage.assert(args)

        if (messageRegex.test(rawMessage)) {
            return
        }

        // Remove extra whitespace
        const message = rawMessage.replace(/  +/g, ' ').trim()

        if (message.length < 1 || message.length > maxMessageLength) {
            return
        }

        if (message.startsWith('!') && this.processCommand(message, user)) {
            return
        }

        if (user.room) {
            user.room.send(user, 'send_message', { id: user.id, message }, [user], true)
        }
    }

    sendSafe(args: unknown, user: GameUser) {
        const { safe } = SendSafe.assert(args)

        if (user.room) {
            user.room.send(user, 'send_safe', { id: user.id, safe }, [user], true)
        }
    }

    sendEmote(args: unknown, user: GameUser) {
        const { emote } = SendEmote.assert(args)

        if (user.room) {
            user.room.send(user, 'send_emote', { id: user.id, emote }, [user], true)
        }
    }

    sendJoke(args: unknown, user: GameUser) {
        const { joke } = SendJoke.assert(args)

        if (user.room) {
            user.room.send(user, 'send_joke', { id: user.id, joke }, [user], true)
        }
    }

    sendTour(args: unknown, user: GameUser) {
        const { roomId } = SendTour.assert(args)

        if (roomId !== user.room?.id) {
            return
        }

        if (user.room) {
            user.room.send(user, 'send_tour', { id: user.id, roomId }, [user], true)
        }
    }

    // Commands

    bindCommands() {
        for (const command in this.commands) {
            this.commands[command] = this.commands[command].bind(this)
        }
    }

    processCommand(message: string, user: GameUser) {
        message = message.substring(1)

        const args = message.split(' ')
        const command = args.shift()?.toLowerCase()

        if (command && command in this.commands) {
            this.commands[command](args, user)
            return true
        }

        return false
    }

    addItem(args: string[], user: GameUser) {
        if (user.isModerator) {
            // @ts-expect-error temp
            this.plugins.item.addItem({ item: parseInt(args[0]) }, user)
        }
    }

    addFurniture(args: string[], user: GameUser) {
        if (user.isModerator) {
            // @ts-expect-error temp
            this.plugins.igloo.addFurniture({ furniture: parseInt(args[0]) }, user)
        }
    }

    addCoins(args: string[], user: GameUser) {
        if (user.isModerator) {
            user.updateCoins(args[0], true)
        }
    }

    joinRoom(args: string[], user: GameUser) {
        if (!user.isModerator) {
            return
        }

        let room = args[0]

        if (!room) {
            return
        }

        // @ts-expect-error temp
        if (!isNaN(room)) {
            // @ts-expect-error temp
            this.plugins.join.joinRoom({ room: parseInt(room) }, user)
            return
        }

        // @ts-expect-error temp
        room = Object.values(this.rooms).find(r => r.name === room.toLowerCase())

        if (room) {
            // @ts-expect-error temp
            this.plugins.join.joinRoom({ room: room.id }, user)
        }
    }

    id(args: string[], user: GameUser) {
        user.send('error', { error: `Your ID: ${user.id}` })
    }

    userPopulation(args: string[], user: GameUser) {
        // @ts-expect-error temp
        user.send('error', { error: `Users online: ${this.handler.population}` })
    }

}
