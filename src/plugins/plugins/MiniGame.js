import Plugin from '../Plugin'


export default class MiniGame extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'start_game': this.startGame,
            'send_move': this.sendMove
        }
    }

    startGame(args, user) {
        if (user.waddle && user.waddle.id == user.room.id) {
            user.waddle.startGame(user)
        }
    }

    sendMove(args, user) {
        if (user.waddle && user.waddle.id == user.room.id) {
            user.waddle.sendMove(args, user)
        }
    }

}
