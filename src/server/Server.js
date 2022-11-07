import getSocketAddress from '@objects/user/getSocketAddress'
import UserFactory from '@objects/user/UserFactory'

import RateLimiterFlexible from 'rate-limiter-flexible'


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

        if (config.rateLimit.enabled) {
            this.connectionLimiter = this.createLimiter(config.rateLimit.addressConnectsPerSecond)
            this.addressLimiter = this.createLimiter(config.rateLimit.addressEventsPerSecond)
            this.userLimiter = this.createLimiter(config.rateLimit.userEventsPerSecond)
        }

        this.server = io.listen(config.worlds[id].port)
        this.server.on('connection', this.onConnection.bind(this))
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

    onConnection(socket) {
        if (!this.config.rateLimit.enabled) {
            this.initUser(socket)
            return
        }

        let address = getSocketAddress(socket, this.config)

        this.connectionLimiter.consume(address)
            .then(() => {
                this.initUser(socket)
            })
            .catch(() => {
                socket.disconnect(true)
            })
    }

    initUser(socket) {
        let user = UserFactory(this, socket)

        this.users[socket.id] = user

        console.log(`[${this.id}] Connection from: ${socket.id} ${user.address}`)

        socket.on('message', (message) => this.onMessage(message, user))
        socket.on('disconnect', () => this.onDisconnect(user))
    }

    onMessage(message, user) {
        if (!this.config.rateLimit.enabled) {
            this.handler.handle(message, user)
            return
        }

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

    onDisconnect(user) {
        console.log(`[${this.id}] Disconnect from: ${user.socket.id} ${user.address}`)
        this.handler.close(user)
    }

}
