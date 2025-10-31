import Plugin from './Plugin'

import type GameHandler from '../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'
import type OpenIgloos from '@objects/room/OpenIgloos'

export default class GamePlugin extends Plugin {

    usersById: Record<number, GameUser>
    openIgloos: OpenIgloos

    constructor(handler: GameHandler) {
        super(handler)

        this.usersById = handler.usersById
        this.openIgloos = handler.openIgloos
    }

    get crumbs() {
        return (this.handler as GameHandler).crumbs
    }

    get rooms() {
        return (this.handler as GameHandler).rooms
    }

}
