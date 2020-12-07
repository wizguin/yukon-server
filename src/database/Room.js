export default class Room {

    constructor(data) {
        Object.assign(this, data)

        this.users = {}
    }

    get userValues() {
        return Object.values(this.users)
    }

    get strings() {
        return this.userValues.map(user => user.getData())
    }

    add(user) {
        this.users[user.socket.id] = user

        user.send('join_room', { room: this.id, users: this.strings })
        this.send(user, 'add_player', { user: user.getData() })
    }

    remove(user) {
        this.send(user, 'remove_player', { user: user.data.id })

        delete this.users[user.socket.id]
    }

    /**
     * Sends a packet to all users in the room, by default the client is excluded.
     *
     * @param {User} user - Client User object
     * @param {string} action - Packet name
     * @param {object} args - Packet arguments
     * @param {Array} filter - Users to exclude
     */
    send(user, action, args = {}, filter = [ user ]) {
        let users = this.userValues.filter(u => !filter.includes(u))

        for (let u of users) {
            u.send(action, args)
        }
    }

}