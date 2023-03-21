export default class BaseInstance {

    constructor(waddle) {
        this.users = [...waddle.users]
    }

    init() {
        for (let user of this.users) {
            user.joinRoom(user.handler.rooms[this.id])
        }
    }

}
