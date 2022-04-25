import Plugin from '../Plugin'


export default class MiniGame extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'game_over': this.gameOver
        }
    }

    gameOver(args, user) {
        if (!user.room.game) {
            return
        }

        user.updateCoins(args.coins)

        user.send('game_over', { coins: user.data.coins })
    }

}
