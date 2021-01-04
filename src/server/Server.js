import User from '../database/User'

import io from 'socket.io'


export default class Server {

    constructor(id, config, users, db, handler) {
        this.users = users
        this.db = db
        this.handler = handler

        this.server = io.listen(config.port)
        this.server.on('connection', this.connectionMade.bind(this))

        console.log(`[Server] Started world ${id} on port ${config.port}`)
    }

    connectionMade(socket) {
        console.log(`[Server] Connection from: ${socket.id}`)
        let user = new User(socket, this.handler)
        this.users[socket.id] = user

        socket.on('message', (message) => { this.messageReceived(message, user) })
        socket.on('disconnect', () => { this.connectionLost(user) })
    }

    messageReceived(message, user) {
        this.handler.handle(message, user)
    }

    connectionLost(user) {
        console.log(`[Server] Disconnect from: ${user.socket.id}`)
        this.handler.close(user)
    }

}
