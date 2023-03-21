import GamePlugin from '@plugin/GamePlugin'


export default class Waddle extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'get_waddles': this.getWaddles,
            'join_waddle': this.joinWaddle,
            'leave_waddle': this.leaveWaddle
        }
    }

    getWaddles(args, user) {
        let waddles = Object.fromEntries(Object.values(user.room.waddles).map(waddle => {
            let users = waddle.users.map(user => user ? user.data.username : null)

            return [waddle.id, users]
        }))

        user.send('get_waddles', { waddles: waddles })
    }

    joinWaddle(args, user) {
        let waddle = user.room.waddles[args.waddle]

        if (waddle && waddle.notFull && !user.waddle) {
            waddle.add(user)
        }
    }

    leaveWaddle(args, user) {
        if (user.waddle) {
            user.waddle.remove(user)
        }
    }

}
