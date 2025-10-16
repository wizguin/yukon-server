import PluginManager from '@plugin/PluginManager'

import EventEmitter from 'events'


export default class BaseHandler {

    constructor(id, users, db, config) {
        this.id = id
        this.users = users
        this.db = db
        this.config = config

        this.logging = true

        this.plugins

        this.events = new EventEmitter({ captureRejections: true })

        this.events.on('error', (error) => {
            this.error(error)
        })
    }

    startPlugins(pluginsDir = '') {
        this.plugins = new PluginManager(this, pluginsDir)
    }

    handle(message, user) {
        try {
            if (this.logging) {
                console.log(`[${this.id}] Received: ${message.action} ${JSON.stringify(message.args)}`)
            }

            if (this.handleGuard(message, user)) {
                return user.close()
            }

            if (message.action in this.config.cooldowns) {
                this.setCooldown(message, user)
            }

            this.events.emit(message.action, message.args, user)

            if (user.events) {
                user.events.emit(message.action, message.args, user)
            }

        } catch(error) {
            this.error(error)
        }
    }

    handleGuard(message, user) {
        return false
    }

    setCooldown({ action }, user) {
        user.cooldowns[action] = Date.now()
    }

    isOnCooldown({ action }, user) {
        if (!(action in this.config.cooldowns)) {
            return false
        }

        if (!(action in user.cooldowns)) {
            return false
        }

        const cooldown = this.config.cooldowns[action]
        const lastUsed = user.cooldowns[action]

        return Date.now() - lastUsed < cooldown
    }

    close(user) {
        delete this.users[user.socket.id]
    }

    error(error) {
        console.error(`[${this.id}] ERROR: ${error.stack}`)
    }

}
