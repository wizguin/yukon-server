export default class WaddleInstance {

    constructor(waddle) {
        this.users = [...waddle.users]
    }

    init() {
        for (let user of this.users) {
            user.waddle = this
            user.joinRoom(user.handler.rooms[this.id])
        }
    }

    startGame(user) {
        // To be overridden in derived class
    }

    remove(user) {
        let seat = this.users.indexOf(user)
        this.users[seat] = null

        user.waddle = null
    }

}
