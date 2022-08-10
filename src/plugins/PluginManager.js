import fs from 'fs'
import path from 'path'


export default class PluginManager {

    constructor(handler, pluginsDir) {
        this.events = handler.events
        this.id = handler.id

        this.dir = `${__dirname}/plugins${pluginsDir}`
        this.plugins = {}

        this.loadPlugins(handler)
    }

    loadPlugins(handler) {
        let plugins = fs.readdirSync(this.dir).filter(file => {
            return path.extname(file) == '.js'
        })

        for (let plugin of plugins) {
            let pluginImport = require(path.join(this.dir, plugin)).default
            let pluginObject = new pluginImport(handler)

            this.plugins[plugin.replace('.js', '').toLowerCase()] = pluginObject

            this.loadEvents(pluginObject)
        }

        let pluginsCount = Object.keys(this.plugins).length
        let eventsCount = this.events._eventsCount

        console.log(`[${this.id}] Loaded ${pluginsCount} plugins and ${eventsCount} events`)
    }

    loadEvents(plugin) {
        for (let event in plugin.events) {
            this.events.on(event, plugin.events[event].bind(plugin))
        }
    }

}
