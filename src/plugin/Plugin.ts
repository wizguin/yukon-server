import type Handler from '../handler/Handler'
import type OpenIgloos from '@objects/room/OpenIgloos'
import type User from '@objects/user/User'

export type EventHandler = (...args: any[]) => void | Promise<void>

export default class Plugin {

    handler: Handler
    users: Record<string, User>
    usersById: Record<number, User>
    openIgloos: OpenIgloos
    events: Record<string, EventHandler> = {}

    constructor(handler: Handler) {
        this.handler = handler

        this.users = handler.users
        this.usersById = handler.usersById
        this.openIgloos = handler.openIgloos
    }

    get rooms() {
        return this.handler.rooms
    }

}
