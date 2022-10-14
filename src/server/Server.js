import RateLimiterFlexible from 'rate-limiter-flexible'


import UserFactory from '@objects/user/UserFactory'


export default class Server {

    constructor(id, users, db, handler, config) {
        this.id = id
        this.users = users
        this.db = db
        this.handler = handler
        this.config = config

        let io = this.createIo(config.socketio, {
            cors: {
                origin: config.cors.origin,
                methods: ['GET', 'POST']
            },
            path: '/'
        })

        this.addressLimiter = this.createLimiter(config.rateLimit.addressEventsPerSecond)
        this.userLimiter = this.createLimiter(config.rateLimit.userEventsPerSecond)

        this.server = io.listen(config.worlds[id].port)
        this.server.on('connection', this.connectionMade.bind(this))
    }

    createLimiter(points, duration = 1) {
        return new RateLimiterFlexible.RateLimiterMemory({
            points: points,
            duration: duration
        })
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
        let user = UserFactory(this, socket)

        this.users[socket.id] = user

        console.log(`[${this.id}] Connection from: ${socket.id} ${user.address}`)

        socket.on('message', (message) => this.messageReceived(message, user))
        socket.on('disconnect', () => this.connectionLost(user))
    }

    messageReceived(message, user) {
        this.addressLimiter.consume(user.address)
            .then(() => {

                let id = user.getId()

                this.userLimiter.consume(id)
                    .then(() => {
                        this.handler.handle(message, user)
                    })
                    .catch(() => {
                        // Blocked user
                    })

            })
            .catch(() => {
                // Blocked address
            })
    }

    connectionLost(user) {
        console.log(`[${this.id}] Disconnect from: ${user.socket.id} ${user.address}`)
        this.handler.close(user)
    }

}
