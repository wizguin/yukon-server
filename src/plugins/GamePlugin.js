import Plugin from './Plugin'


export default class GamePlugin extends Plugin {

    constructor(handler) {
        super(handler)

        this.usersById = handler.usersById
        this.openIgloos = handler.openIgloos
    }

    get crumbs() {
        return this.handler.crumbs
    }

    get rooms() {
        return this.handler.rooms
    }

}
