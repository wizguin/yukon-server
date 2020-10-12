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
        user.send('load_player', { user: user.getData(), inventory: user.inventory, room: user.room })
    }

    joinServer(args, user) {
        user.x = args.x
        user.y = args.y

        this.add(user)
    }

    joinRoom(args, user) {
        this.remove(user)

        user.room = args.room
        user.x = args.x
        user.y = args.y
        user.frame = 1

        this.add(user)
    }

    // Functions

    add(user) {
        this.rooms[user.room].users[user.socket.id] = user

        user.send('join_room', { room: user.room, users: this.getUsers(user.room) })
        this.sendRoom(user, 'add_player', { user: user.getData() })
    }

    remove(user) {
        this.sendRoom(user, 'remove_player', { user: user.data.id })
        delete this.rooms[user.room].users[user.socket.id]
    }

    getUsers(room) {
        let users = []
        for (let user of Object.values(this.rooms[room].users)) {
            users.push(user.getData())
        }
        return users
    }

}
