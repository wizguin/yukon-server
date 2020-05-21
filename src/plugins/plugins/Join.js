import Plugin from '../Plugin'


export default class Join extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'load_player': this.loadPlayer,
            'join_server': this.joinServer
        }
    }

    // Events

    loadPlayer(args, user) {
        user.send('load_player', { user: user.data.dataValues })
    }

    joinServer(args, user) {
        this.add(user)
    }

    // Functions

    add(user) {
        this.rooms[user.room].users.push(user)

        user.send('join_room', { room: user.room, users: this.getUsers(user.room) })
        this.sendRoom(user, 'add_player', { user: user.getData() })
    }

    remove(user) {
        this.sendRoom(user, 'remove_player', { user: user.data.id })
        this.rooms[user.room].users.splice(this.rooms[user.room].users.indexOf(user))
    }

    getUsers(room) {
        let users = []
        for (let user of this.rooms[room].users) {
            users.push(user.getData())
        }
        return users
    }

}
