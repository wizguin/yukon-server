import BaseInstance from '../BaseInstance'


export default class CardInstance extends BaseInstance {

    constructor(waddle) {
        super(waddle)

        this.id = 998
    }

    start() {
        let users = this.users.filter(Boolean).map(user => {
            return {
                username: user.username,
                color: user.color
            }
        })

        this.send('start_game', { users: users })

        super.start()
    }

}
