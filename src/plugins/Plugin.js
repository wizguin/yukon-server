export default class Plugin {

    constructor(users, rooms) {
        this.users = users
        this.rooms = rooms
    }

    sendRoom(user, action, args = {}) {
        for (let u of Object.values(this.rooms[user.room].users)) {
            if (u != user) u.send(action, args)
        }
    }

}
