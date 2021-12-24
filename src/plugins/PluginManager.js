import fs from 'fs'
import path from 'path'


export default class PluginManager {

    constructor(handler) {
        this.dir = `${__dirname}/plugins`

        this.events = {}
        this.plugins = {}

        this.loadPlugins(handler)
    }

    loadPlugins(handler) {
        fs.readdirSync(this.dir).forEach(plugin => {
            let pluginImport = require(path.join(this.dir, plugin)).default
            let pluginObject = new pluginImport(handler)

            this.plugins[plugin.replace('.js', '').toLowerCase()] = pluginObject

            this.loadEvents(pluginObject)
        })
    }

    loadEvents(plugin) {
        for (let event in plugin.events) {
            this.events[event] = plugin.events[event].bind(plugin)
        }
    }

    getEvent(event, args, user) {
        try {
            this.events[event](args, user)
        } catch(error) {
            console.error(`[PluginManager] Event (${event}) not handled: ${error}`)
        }
    }

}
