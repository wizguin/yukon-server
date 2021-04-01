export default class Plugin {

    constructor(handler) {
        this.db = handler.db
        this.users = handler.users
        this.usersById = handler.usersById
        this.config = handler.config
        this.items = handler.items
        this.furnitures = handler.furnitures
        this.rooms = handler.rooms
    }

}
