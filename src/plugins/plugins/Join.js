import Plugin from '../Plugin'


export default class Join extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'load_player': this.loadPlayer,
            'join_server': this.joinServer,
            'join_room': this.joinRoom
        }
    }

    // Events

    loadPlayer(args, user) {
        user.room = this.getRandomSpawn()
        user.send('load_player', { user: user.string, inventory: user.inventory, room: user.room.id })
    }

    joinServer(args, user) {
        user.x = args.x
        user.y = args.y

        user.room.add(user)
    }

    joinRoom(args, user) {
        user.room.remove(user)

        user.room = this.rooms[args.room]
        user.x = args.x
        user.y = args.y
        user.frame = 1

        user.room.add(user)
    }

    // Functions

    getRandomSpawn() {
        let spawns = Object.values(this.rooms).filter(room => room.spawn)

        return spawns[Math.floor(Math.random() * spawns.length)]
    }

}
