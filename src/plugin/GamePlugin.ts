import Plugin from './Plugin'

import type Handler from '../handler/Handler'
import type OpenIgloos from '@objects/room/OpenIgloos'
import type User from '@objects/user/User'

export default class GamePlugin extends Plugin {

    usersById: Record<number, User>
    openIgloos: OpenIgloos

    constructor(handler: Handler) {
        super(handler)

        this.usersById = handler.usersById
        this.openIgloos = handler.openIgloos
    }

    get rooms() {
        return this.handler.rooms
    }

}
