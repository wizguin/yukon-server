import type Handler from '../handler/Handler'
import type User from '@objects/user/User'

export type EventHandler = (...args: any[]) => void | Promise<void>

export default class Plugin {

    handler: Handler
    users: Record<string, User>
    events: Record<string, EventHandler> = {}

    constructor(handler: Handler) {
        this.handler = handler

        this.users = handler.users
    }

}
