export default class Plugin {

    constructor(handler) {
        this.users = handler.users
        this.items = handler.items
        this.rooms = handler.rooms
    }

}
