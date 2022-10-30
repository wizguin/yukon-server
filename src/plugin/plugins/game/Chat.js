import GamePlugin from '@plugin/GamePlugin'

import { hasProps, isNumber, isString, isLength } from '@utils/validation'


export default class Chat extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'send_message': this.sendMessage,
            'send_safe': this.sendSafe,
            'send_emote': this.sendEmote
        }

        this.commands = {
            'ai': this.addItem,
            'af': this.addFurniture,
            'ac': this.addCoins,
            'jr': this.joinRoom,
            'id': this.id,
            'users': this.userPopulation
        }

        this.bindCommands()

        this.messageRegex = /[^ -~]/i
        this.maxMessageLength = 48
    }

    // Events

    sendMessage(args, user) {
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

        user.room.send(user, 'send_message', { id: user.id, message: args.message }, [user], true)
    }

    sendSafe(args, user) {
        if (!hasProps(args, 'safe')) {
            return
        }

        if (!isNumber(args.safe)) {
            return
        }

        user.room.send(user, 'send_safe', { id: user.id, safe: args.safe }, [user], true)
    }

    sendEmote(args, user) {
        if (!hasProps(args, 'emote')) {
            return
        }

        if (!isNumber(args.emote)) {
            return
        }

        user.room.send(user, 'send_emote', { id: user.id, emote: args.emote }, [user], true)
    }

    // Commands

    bindCommands() {
        for (let command in this.commands) {
            this.commands[command] = this.commands[command].bind(this)
        }
    }

    processCommand(message, user) {
        message = message.substring(1)

        let args = message.split(' ')
        let command = args.shift().toLowerCase()

        if (command in this.commands) {
            this.commands[command](args, user)
            return true
        }

        return false
    }

    addItem(args, user) {
        if (user.isModerator) {
            this.plugins.item.addItem({ item: args[0] }, user)
        }
    }

    addFurniture(args, user) {
        if (user.isModerator) {
            this.plugins.igloo.addFurniture({ furniture: args[0] }, user)
        }
    }

    addCoins(args, user) {
        if (user.isModerator) {
            user.updateCoins(args[0], true)
        }
    }

    joinRoom(args, user) {
        if (!user.isModerator) {
            return
        }

        let room = args[0]

        if (!isNaN(room)) {
            this.plugins.join.joinRoom({ room: room }, user)
            return
        }

        room = Object.values(this.rooms).find(r => r.name == room.toLowerCase())

        if (room) {
            this.plugins.join.joinRoom({ room: room.id }, user)
        }
    }

    id(args, user) {
        user.send('error', { error: `Your ID: ${user.id}` })
    }

    userPopulation(args, user) {
        user.send('error', { error: `Users online: ${this.handler.population}` })
    }

}
