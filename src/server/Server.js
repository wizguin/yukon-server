import RateLimiterFlexible from 'rate-limiter-flexible'

import User from '../objects/user/User'


export default class Server {

    constructor(id, users, db, handler, config) {
        this.users = users
        this.db = db
        this.handler = handler

        let io = this.createIo(config.socketio, {
            cors: {
                origin: config.cors.origin,
                methods: ['GET', 'POST']
            },
            path: '/'
        })

        this.rateLimiter = new RateLimiterFlexible.RateLimiterMemory({
            // 20 events allowed per second
            points: 20,
            duration: 1
        })

        this.server = io.listen(config.worlds[id].port)
        this.server.on('connection', this.connectionMade.bind(this))

        console.log(`[Server] Started world ${id} on port ${config.worlds[id].port}`)
    }

    createIo(config, options) {
        let server = (config.https)
            ? this.httpsServer(config.ssl)
            : this.httpServer()

        return require('socket.io')(server, options)
    }

    httpServer() {
        return require('http').createServer()
    }

    httpsServer(ssl) {
        let fs = require('fs')
        let loaded = {}

        // Loads ssl files
        for (let key in ssl) {
            loaded[key] = fs.readFileSync(ssl[key]).toString()
        }

        return require('https').createServer(loaded)
    }

    connectionMade(socket) {
        console.log(`[Server] Connection from: ${socket.id}`)
        let user = new User(socket, this.handler)
        this.users[socket.id] = user

        socket.on('message', (message) => this.messageReceived(message, user))
        socket.on('disconnect', () => this.connectionLost(user))
    }

    messageReceived(message, user) {
        // Consume 1 point per event from IP address
        this.rateLimiter.consume(user.socket.handshake.address)
            .then(() => {
                // Allowed
                this.handler.handle(message, user)
            })
            .catch(() => {
                // Blocked
            })
    }

    connectionLost(user) {
        console.log(`[Server] Disconnect from: ${user.socket.id}`)
        this.handler.close(user)
    }

}
