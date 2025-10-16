export default class MatchmakerPlayer {

    constructor(user, tick) {
        this.user = user
        this.tick = tick
    }

    send(action, args = {}) {
        this.user.send(action, args)
    }

}
