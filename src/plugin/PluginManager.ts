import type BaseHandler from '../handlers/BaseHandler'
import type { EventHandler } from './Plugin'
import type Plugin from './Plugin'

import { join, parse } from 'path'
import type { EventEmitter } from 'stream'
import { readdir } from 'fs/promises'

type PluginConstructor = new (handler: BaseHandler) => Plugin

type PluginModule = {
    default: PluginConstructor
}

export default class PluginManager {

    events: EventEmitter
    id: string
    dir: string
    plugins: Record<string, Plugin> = {}

    constructor(private handler: BaseHandler, pluginsDir: string) {
        this.events = handler.events
        this.id = handler.id

        this.dir = join(__dirname, 'plugins', pluginsDir)

        this.loadPlugins().catch(error => {
            this.handler.handleError(error)
        })
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

        const { default: pluginClass } = await import(join(this.dir, name)) as PluginModule

        const plugin = new pluginClass(this.handler)

        this.plugins[name.toLowerCase()] = plugin

        this.loadEvents(plugin)
    }

    loadEvents(plugin: Plugin) {
        for (const event in plugin.events) {
            this.loadEvent(plugin, event)
        }
    }

    private loadEvent(plugin: Plugin, event: string) {
        const handler = plugin.events[event]

        this.events.on(event, (...args: unknown[]) => this.handleEvent(plugin, handler, args))
    }

    private handleEvent(plugin: Plugin, handler: EventHandler, args: unknown[]) {
        const result = handler.apply(plugin, args)

        if (!result) {
            return
        }

        result.catch(error => {
            this.events.emit('error', error)
        })
    }

}
