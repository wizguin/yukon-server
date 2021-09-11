export default class WaddleInstance {

    constructor(waddle) {
        this.users = [...waddle.users]
    }

    start() {
        for (let user of this.users) {
            user.waddle = this
            user.joinRoom(user.handler.rooms[this.roomId])
        }
    }

    remove(user) {
        let seat = this.users.indexOf(user)
        this.users[seat] = null

        user.waddle = null
    }

}
