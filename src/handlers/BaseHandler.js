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

            this.events.emit(message.action, message.args, user)

        } catch(error) {
            this.error(error)
        }
    }

    handleGuard(message, user) {
        return false
    }

    close(user) {
        delete this.users[user.socket.id]
    }

    error(error) {
        console.error(`[${this.id}] ERROR: ${error.stack}`)
    }

}
