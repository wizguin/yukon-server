import Plugin from '../Plugin'

import profaneWords from 'profane-words'


export default class Chat extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'send_message': this.sendMessage,
            'send_safe': this.sendSafe,
            'send_emote': this.sendEmote
        }

        this.commands = {
            'ai': this.addItem,
            'af': this.addFurniture,
            'users': this.userPopulation
        }

        this.bindCommands()
    }

    // Events

    sendMessage(args, user) {
        // Todo: message validation
        if (args.message.startsWith('!')) {
            return this.processCommand(args.message.substring(1), user)
        }

        if (profaneWords.some((word) => args.message.toLowerCase().indexOf(word) >= 0)) {
            return
        }

        user.room.send(user, 'send_message', { id: user.data.id, message: args.message }, [user], true)
    }

    sendSafe(args, user) {
        user.room.send(user, 'send_safe', { id: user.data.id, safe: args.safe }, [user], true)
    }

    sendEmote(args, user) {
        user.room.send(user, 'send_emote', { id: user.data.id, emote: args.emote }, [user], true)
    }

    // Commands

    bindCommands() {
        for (let command in this.commands) {
            this.commands[command] = this.commands[command].bind(this)
        }
    }

    processCommand(message, user) {
        let args = message.split(' ')
        let command = args.shift()

        if (command in this.commands) {
            return this.commands[command](args, user)
        }
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

    userPopulation(args, user) {
        user.send('error', { error: `Users online: ${this.handler.population}` })
    }

}
