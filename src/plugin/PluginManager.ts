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
        const plugins = fs.readdirSync(this.dir).filter(file => path.extname(file) == '.ts')

        for (const plugin of plugins) {
            const pluginImport = require(path.join(this.dir, plugin)).default
            const pluginObject = new pluginImport(handler)

            this.plugins[plugin.replace('.ts', '').toLowerCase()] = pluginObject

            this.loadEvents(pluginObject)
        }

        const pluginsCount = Object.keys(this.plugins).length
        // @ts-expect-error temp
        const eventsCount = this.events._eventsCount

        console.log(`[${this.id}] Loaded ${pluginsCount} plugins and ${eventsCount} events`)
    }

    loadEvents(plugin: Plugin) {
        for (const event in plugin.events) {
            this.events.on(event, plugin.events[event].bind(plugin))
        }
    }

}
