import getSocketAddress from '@objects/user/getSocketAddress'
import RateLimiter from '../ratelimit/RateLimiter'
import UserFactory from '@objects/user/UserFactory'

import { RateLimiterRes } from 'rate-limiter-flexible'


export default class Server {

    constructor(id, users, db, handler, config) {
        this.id = id
        this.users = users
        this.db = db
        this.handler = handler
        this.config = config

        const io = this.createIo(config.socketio, {
            cors: {
                origin: config.cors.origin,
                methods: ['GET', 'POST']
            },
            path: '/'
        })

        this.rateLimiter = config.rateLimit.enabled
            ? new RateLimiter(config)
            : null

        this.server = io.listen(config.worlds[id].port)

        this.server.on('connection', socket => this.onConnection(socket))
    }

    createIo(config, options) {
        const server = config.https
            ? this.httpsServer(config.ssl)
            : this.httpServer()

        return require('socket.io')(server, options)
    }

    httpServer() {
        return require('http').createServer()
    }

    httpsServer(ssl) {
        const fs = require('fs')
        const loaded = {}

        // Loads ssl files
        for (const key in ssl) {
            loaded[key] = fs.readFileSync(ssl[key]).toString()
        }

        return require('https').createServer(loaded)
    }

    async onConnection(socket) {
        try {
            if (this.rateLimiter) {
                const address = getSocketAddress(socket, this.config)

                await this.rateLimiter.addressConnects.consume(address)
            }

            this.initUser(socket)

        } catch (error) {
            if (!(error instanceof RateLimiterRes)) {
                this.handler.error(error)
            }

            socket.disconnect(true)
        }
    }

    initUser(socket) {
        const user = UserFactory(this, socket)

        this.users[socket.id] = user

        console.log(`[${this.id}] Connection from: ${socket.id} ${user.address}`)

        socket.on('message', message => this.onMessage(message, user))
        socket.on('disconnect', () => this.onDisconnect(user))
    }

    async onMessage(message, user) {
        if (this.handler.isOnCooldown(message, user)) {
            return
        }

        try {
            if (this.rateLimiter) {
                await this.rateLimiter.addressEvents.consume(user.address)
                await this.rateLimiter.userEvents.consume(user.getId())
            }

            this.handler.handle(message, user)

        } catch (error) {
            if (!(error instanceof RateLimiterRes)) {
                this.handler.error(error)
            }
        }
    }

    onDisconnect(user) {
        console.log(`[${this.id}] Disconnect from: ${user.socket.id} ${user.address}`)

        this.handler.close(user)
    }

}
