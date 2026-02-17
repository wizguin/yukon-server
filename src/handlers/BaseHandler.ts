import { config } from '@config'
import type GameUser from '@objects/user/GameUser'
import type { Message } from '../server/Server'
import PluginManager from '@plugin/PluginManager'
import type User from '@objects/user/User'

import EventEmitter from 'events'

export default class BaseHandler {

    logging = true
    plugins!: PluginManager
    events: EventEmitter

    constructor(
        public id: string,
        public users: Record<string, User | GameUser>
    ) {
        this.events = new EventEmitter({ captureRejections: true })

        this.events.on('error', error => {
            this.error(error)
        })
    }

    startPlugins(pluginsDir = '') {
        this.plugins = new PluginManager(this, pluginsDir)
    }

    handle(message: Message, user: User | GameUser) {
        try {
            if (this.logging) {
                console.log(`[${this.id}] Received: ${message.action} ${JSON.stringify(message.args)}`)
            }

            if (this.handleGuard(message, user)) {
                return user.close()
            }

            if (message.action in config.cooldowns) {
                this.setCooldown(message, user)
            }

            this.events.emit(message.action, message.args, user)

            if (user.events) {
                user.events.emit(message.action, message.args, user)
            }

        } catch (error) {
            if (error instanceof Error) {
                this.error(error)
            }
        }
    }

    handleGuard(_message: Message, _user: User | GameUser) {
        return false
    }

    setCooldown({ action }: Message, user: User | GameUser) {
        user.cooldowns[action] = Date.now()
    }

    isOnCooldown({ action }: Message, user: User | GameUser) {
        if (!(action in config.cooldowns)) {
            return false
        }

        if (!(action in user.cooldowns)) {
            return false
        }

        const cooldown = config.cooldowns[action]
        const lastUsed = user.cooldowns[action]

        return Date.now() - lastUsed < cooldown
    }

    close(user: User | GameUser) {
        delete this.users[user.socket.id]
    }

    error(error: Error) {
        console.error(`[${this.id}] ERROR: ${error.stack}`)
    }

}
