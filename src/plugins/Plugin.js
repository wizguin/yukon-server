export default class Plugin {

    constructor(handler) {
        this.handler = handler

        this.db = handler.db
        this.users = handler.users
        this.usersById = handler.usersById
        this.config = handler.config
        this.crumbs = handler.crumbs
        this.rooms = handler.rooms
    }

    get plugins() {
        return this.handler.plugins.plugins
    }

}
