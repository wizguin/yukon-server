import type BaseHandler from '../handlers/BaseHandler'
import type Plugin from './Plugin'

import { join, parse } from 'path'
import type { EventEmitter } from 'stream'
import { readdir } from 'fs/promises'

export default class PluginManager {

    events: EventEmitter
    id: string
    dir: string
    plugins: Record<string, Plugin> = {}

    constructor(private handler: BaseHandler, pluginsDir: string) {
        this.events = handler.events
        this.id = handler.id

        this.dir = join(__dirname, 'plugins', pluginsDir)

        this.loadPlugins()
    }

    get pluginsCount() {
        return Object.keys(this.plugins).length
    }

    get eventsCount() {
        let eventsCount = 0

        for (const plugin of Object.values(this.plugins)) {
            eventsCount += Object.keys(plugin.events).length
        }

        return eventsCount
    }

    async loadPlugins() {
        const files = await readdir(this.dir)

        await Promise.all(files.map(file => this.loadPlugin(file)))

        console.log(`[${this.id}] Loaded ${this.pluginsCount} plugins and ${this.eventsCount} events`)
    }

    async loadPlugin(file: string) {
        const name = parse(file).name
        const plugin = (await import(join(this.dir, name))).default

        this.plugins[name.toLowerCase()] = new plugin(this.handler)

        this.loadEvents(this.plugins[name.toLowerCase()])
    }

    loadEvents(plugin: Plugin) {
        for (const event in plugin.events) {
            this.events.on(event, plugin.events[event].bind(plugin))
        }
    }

}
