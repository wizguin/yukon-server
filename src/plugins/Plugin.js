export default class Plugin {

    constructor(handler) {
        this.users = handler.users
        this.usersById = handler.usersById
        this.items = handler.items
        this.rooms = handler.rooms
    }

}
