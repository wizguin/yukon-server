import Plugin from '../Plugin'


export default class Get extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'get_player': this.getPlayer
        }
    }

    async getPlayer(args, user) {
        if (!args.id) return

        let userData = await this.db.getUserById(args.id)
        let { banned, coins, loginKey, password, rank, ...penguin } = userData.dataValues

        if (userData) {
            user.send('get_player', { penguin: penguin })
        }
    }

}
