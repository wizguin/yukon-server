import GamePlugin from '@plugin/GamePlugin'

import type { Args } from '../../../server/Server'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import { hasProps, isLength, isNumber, isString } from '@utils/validation'

type CommandHandler = (args: string[], user: GameUser) => void

export default class Chat extends GamePlugin {

    commands: Record<string, CommandHandler>
    messageRegex: RegExp
    maxMessageLength: number

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            send_message: this.sendMessage,
            send_safe: this.sendSafe,
            send_emote: this.sendEmote,
            send_joke: this.sendJoke,
            send_tour: this.sendTour
        }

        this.commands = {
            ai: this.addItem,
            af: this.addFurniture,
            ac: this.addCoins,
            jr: this.joinRoom,
            id: this.id,
            users: this.userPopulation
        }

        this.bindCommands()

        this.messageRegex = /[^ -~]/i
        this.maxMessageLength = 48
    }

    // Events

    sendMessage(args: Args, user: GameUser) {
        if (!hasProps(args, 'message')) {
            return
        }

        if (!isString(args.message)) {
            return
        }

        if (this.messageRegex.test(args.message)) {
            return
        }

        // Remove extra whitespace
        args.message = args.message.replace(/  +/g, ' ').trim()

        if (!isLength(args.message, 1, this.maxMessageLength)) {
            return
        }

        if (args.message.startsWith('!') && this.processCommand(args.message, user)) {
            return
        }

        if (user.room) {
            user.room.send(user, 'send_message', { id: user.id, message: args.message }, [user], true)
        }
    }

    sendSafe(args: Args, user: GameUser) {
        if (!hasProps(args, 'safe')) {
            return
        }

        if (!isNumber(args.safe)) {
            return
        }

        if (user.room) {
            user.room.send(user, 'send_safe', { id: user.id, safe: args.safe }, [user], true)
        }
    }

    sendEmote(args: Args, user: GameUser) {
        if (!hasProps(args, 'emote')) {
            return
        }

        if (!isNumber(args.emote)) {
            return
        }

        if (user.room) {
            user.room.send(user, 'send_emote', { id: user.id, emote: args.emote }, [user], true)
        }
    }

    sendJoke(args: Args, user: GameUser) {
        if (!hasProps(args, 'joke')) {
            return
        }

        if (!isNumber(args.joke)) {
            return
        }

        if (user.room) {
            user.room.send(user, 'send_joke', { id: user.id, joke: args.joke }, [user], true)
        }
    }

    sendTour(args: Args, user: GameUser) {
        if (!hasProps(args, 'roomId')) {
            return
        }

        if (!isNumber(args.roomId)) {
            return
        }

        if (args.roomId !== user.room?.id) {
            return
        }

        if (user.room) {
            user.room.send(user, 'send_tour', { id: user.id, roomId: args.roomId }, [user], true)
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

    addItem(args: Args, user: GameUser) {
        if (user.isModerator) {
            // @ts-expect-error temp
            this.plugins.item.addItem({ item: args[0] }, user)
        }
    }

    addFurniture(args: Args, user: GameUser) {
        if (user.isModerator) {
            // @ts-expect-error temp
            this.plugins.igloo.addFurniture({ furniture: args[0] }, user)
        }
    }

    addCoins(args: Args, user: GameUser) {
        if (user.isModerator) {
            user.updateCoins(args[0], true)
        }
    }

    joinRoom(args: Args, user: GameUser) {
        if (!user.isModerator) {
            return
        }

        let room = args[0]

        if (!room) {
            return
        }

        if (!isNaN(room)) {
            // @ts-expect-error temp
            this.plugins.join.joinRoom({ room: parseInt(room) }, user)
            return
        }

        room = Object.values(this.rooms).find(r => r.name == room.toLowerCase())

        if (room) {
            // @ts-expect-error temp
            this.plugins.join.joinRoom({ room: room.id }, user)
        }
    }

    id(args: Args, user: GameUser) {
        user.send('error', { error: `Your ID: ${user.id}` })
    }

    userPopulation(args: Args, user: GameUser) {
        // @ts-expect-error temp
        user.send('error', { error: `Users online: ${this.handler.population}` })
    }

}
