import { config } from '@config'
import getSocketAddress from '@objects/user/getSocketAddress'
import RateLimiter from '../ratelimit/RateLimiter'
import User from '@objects/user/User'

import type GameHandler from '../handlers/GameHandler'

import { Server as IoServer } from 'socket.io'
import { RateLimiterRes } from 'rate-limiter-flexible'
import type { Socket } from 'socket.io'
import { type } from 'arktype'

export type Action = string
export type Args = Record<string, any>

const Message = type({
    action: 'string',
    args: type({ '[string]': 'unknown' }).narrow(args => !Array.isArray(args))
})

export type Message = typeof Message.infer

export default class Server {

    rateLimiter: RateLimiter | null
    server: IoServer

    constructor(
        public id: string,
        private users: Record<string, User>,
        public handler: GameHandler
    ) {
        const io = new IoServer({
            cors: {
                origin: config.cors.origin,
                methods: ['GET', 'POST']
            },
            path: '/'
        })

        this.rateLimiter = config.rateLimit.enabled
            ? new RateLimiter()
            : null

        this.server = io.listen(config.worlds[id].port)

        this.server.on('connection', socket => this.onConnection(socket))
    }

    async onConnection(socket: Socket) {
        try {
            if (this.rateLimiter) {
                const address = getSocketAddress(socket)

                await this.rateLimiter.addressConnects.consume(address)
            }

            this.initUser(socket)

        } catch (error) {
            if (!(error instanceof RateLimiterRes)) {
                this.handler.handleError(error)
            }

            socket.disconnect(true)
        }
    }

    initUser(socket: Socket) {
        const user = new User(this.handler, socket)

        this.users[socket.id] = user

        console.log(`[${this.id}] Connection from: ${socket.id} ${user.address}`)

        socket.on('message', (message: unknown) => this.onMessage(message, user))
        socket.on('disconnect', () => this.onDisconnect(user))
    }

    async onMessage(payload: unknown, user: User) {
        try {
            const message = Message.assert(payload)

            if (this.handler.isOnCooldown(message, user)) {
                return
            }

            if (this.rateLimiter) {
                await this.rateLimiter.addressEvents.consume(user.address)
                await this.rateLimiter.userEvents.consume(user.getId())
            }

            this.handler.handle(message, user)

        } catch (error) {
            if (!(error instanceof RateLimiterRes)) {
                this.handler.handleError(error)
            }
        }
    }

    onDisconnect(user: User) {
        console.log(`[${this.id}] Disconnect from: ${user.socket.id} ${user.address}`)

        this.handler.close(user)
    }

}
