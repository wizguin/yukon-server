export default class Plugin {

    constructor(handler) {
        this.users = handler.users
        this.items = handler.items
        this.rooms = handler.rooms
    }

    /**
     * Sends a packet to all users in a room, by default the client is excluded.
     *
     * @param {User} user - Client User object
     * @param {string} action - Packet name
     * @param {object} args - Packet arguments
     * @param {Array} filter - Users to exclude
     */
    sendRoom(user, action, args = {}, filter = [ user ]) {
        let users = Object.values(this.rooms[user.room].users).filter(u => !filter.includes(u))

        for (let u of users) {
            u.send(action, args)
        }
    }

}
