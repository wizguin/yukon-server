import Plugin from '../Plugin'


export default class MiniGame extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'start_game': this.startGame
        }
    }

    startGame(args, user) {
        if (user.waddle && user.waddle.id == user.room.id) {
            user.waddle.startGame(user)
        }
    }

}
