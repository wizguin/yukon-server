export default class Plugin {

    constructor(handler) {
        this.users = handler.users
        this.items = handler.items
        this.rooms = handler.rooms
    }

    sendRoom(user, action, args = {}) {
        for (let u of Object.values(this.rooms[user.room].users)) {
            if (u != user) u.send(action, args)
        }
    }

}
