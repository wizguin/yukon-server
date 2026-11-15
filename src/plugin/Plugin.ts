import type BaseHandler from '../handlers/BaseHandler'
import type GameUser from '@objects/user/GameUser'
import type User from '@objects/user/User'

export type EventHandler = (...args: any[]) => void | Promise<void>

export default class Plugin {

    handler: BaseHandler
    users: Record<string, User | GameUser>
    events: Record<string, EventHandler> = {}

    constructor(handler: BaseHandler) {
        this.handler = handler

        this.users = handler.users
    }

}
