import Plugin from '../Plugin'
import Igloo from '../../database/Igloo'


export default class Join extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'load_player': this.loadPlayer,
            'join_server': this.joinServer,
            'join_room': this.joinRoom,
            'join_igloo': this.joinIgloo
        }
    }

    // Events

    loadPlayer(args, user) {
        user.room = this.getRandomSpawn()

        user.send('load_player', {
            user: user.string,
            room: user.room.id,

            buddies: user.buddy.list,
            ignores: user.ignore.list,
            inventory: user.inventory.list
        })
    }

    joinServer(args, user) {
        user.room.add(user)
    }

    joinRoom(args, user, room = this.rooms[args.room]) {
        if (room === user.room) return
        user.room.remove(user)

        user.room = room
        user.x = args.x
        user.y = args.y
        user.frame = 1

        user.room.add(user)
    }

    async joinIgloo(args, user) {
        let igloo = await this.getIgloo(args.igloo)
        if (igloo) this.joinRoom(args, user, igloo)
    }

    // Functions

    getRandomSpawn() {
        let spawns = Object.values(this.rooms).filter(room => room.spawn)

        return spawns[Math.floor(Math.random() * spawns.length)]
    }

    async getIgloo(id) {
        let internalId = id + 2000 // Ensures igloos are above all default rooms

        if (!(internalId in this.rooms)) {
            let igloo = await this.db.getIgloo(id)
            if (!igloo) return null

            igloo.id = id
            delete igloo.userId

            this.rooms[internalId] = new Igloo(igloo)
        }

        return this.rooms[internalId]
    }

}
