import User from '../database/User'

import io from 'socket.io'


export default class Server {

    constructor(config, users, db, handler) {
        this.users = users
        this.db = db
        this.handler = handler

        this.server = io.listen(config.port)
        this.server.on('connection', this.connectionMade.bind(this))

        console.log(`[Server] Server listening on port ${config.port}`)
    }

    connectionMade(socket) {
        console.log('[Server] Connection from: ', socket.id)
        let user = new User(socket, this.db)
        this.users.push(user)

        socket.on('message', (message) => { this.messageReceived(message, user) })
        socket.on('disconnect', () => { this.connectionLost(user) })
    }

    messageReceived(message, user) {
        this.handler.handle(message, user)
    }

    connectionLost(user) {
        console.log('[Server] Disconnect from: ', user.socket.id)
        this.handler.close(user)
    }

}
