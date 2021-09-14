import WaddleInstance from './WaddleInstance'


export default class SledInstance extends WaddleInstance {

    constructor(waddle) {
        super(waddle)

        this.id = 999
    }

    // Todo: sync start
    startGame(user) {
        let users = this.users.filter(Boolean).map(user => {
            return {
                username: user.data.username,
                color: user.data.color,
                hand: user.data.hand
            }
        })

        user.send('start_game', { seats: this.users.length, users: users })
    }

}
