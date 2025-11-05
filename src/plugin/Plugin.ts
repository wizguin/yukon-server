import type BaseHandler from '../handlers/BaseHandler'
import type Database from '@database/Database'
import type GameUser from '@objects/user/GameUser'
import type User from '@objects/user/User'

export default class Plugin {

    handler: BaseHandler
    users: Record<string, User | GameUser>
    db: Database
    events: Record<string, any> = {}

    constructor(handler: BaseHandler) {
        this.handler = handler

        this.users = handler.users
        this.db = handler.db
    }

    get plugins() {
        return this.handler.plugins.plugins
    }

}
