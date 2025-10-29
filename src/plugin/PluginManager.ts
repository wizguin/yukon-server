import type BaseHandler from '../handlers/BaseHandler'
import type Plugin from './Plugin'

import type { EventEmitter } from 'stream'
import fs from 'fs'
import path from 'path'


export default class PluginManager {

    events: EventEmitter
    id: string
    dir: string
    plugins: Record<string, Plugin> = {}

    constructor(handler: BaseHandler, pluginsDir: string) {
        this.events = handler.events
        this.id = handler.id

        this.dir = `${__dirname}/plugins${pluginsDir}`
        this.plugins = {}

        this.loadPlugins(handler)
    }

    loadPlugins(handler: BaseHandler) {
        let plugins = fs.readdirSync(this.dir).filter(file => {
            return path.extname(file) == '.ts'
        })

        for (let plugin of plugins) {
            let pluginImport = require(path.join(this.dir, plugin)).default
            let pluginObject = new pluginImport(handler)

            this.plugins[plugin.replace('.ts', '').toLowerCase()] = pluginObject

            this.loadEvents(pluginObject)
        }

        let pluginsCount = Object.keys(this.plugins).length
        // @ts-expect-error temp
        let eventsCount = this.events._eventsCount

        console.log(`[${this.id}] Loaded ${pluginsCount} plugins and ${eventsCount} events`)
    }

    loadEvents(plugin: Plugin) {
        for (let event in plugin.events) {
            this.events.on(event, plugin.events[event].bind(plugin))
        }
    }

}
