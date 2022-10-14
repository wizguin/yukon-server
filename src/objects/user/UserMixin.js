import crypto from 'crypto'
import { Op } from 'sequelize'


export default {

    init(server, socket) {
        this.server = server
        this.socket = socket

        this.db = server.db
        this.handler = server.handler
        this.config = server.config

        this.address = this.getSocketAddress()

        this.isModerator = false
    },

    send(action, args = {}) {
        this.socket.emit('message', { action: action, args: args })
    },

    close() {
        this.socket.disconnect(true)
    },

    getId() {
        return (this.id) ? this.id : this.socket.id
    },

    getSocketAddress() {
        let headers = this.socket.handshake.headers
        let ipAddressHeader = this.config.rateLimit.ipAddressHeader

        if (ipAddressHeader && headers[ipAddressHeader]) {
            return headers[ipAddressHeader]
        }

        if (headers['x-forwarded-for']) {
            return headers['x-forwarded-for'].split(',')[0]
        }

        return this.socket.handshake.address
    },

    createLoginHash(randomKey) {
        let userAgent = this.socket.request.headers['user-agent']
        let string = `${this.username}${randomKey}${this.address}${userAgent}`

        return crypto.createHash('sha256').update(string).digest('hex')
    },

    async load(username, selector = null) {
        return await this.reload({
            where: {
                username: username
            },

            include: [
                {
                    model: this.db.authTokens,
                    as: 'authToken',
                    where: {
                        selector: selector
                    },
                    required: false
                },
                {
                    model: this.db.bans,
                    as: 'ban',
                    where: {
                        expires: {
                            [Op.gt]: Date.now()
                        }
                    },
                    required: false
                }
            ]

        }).then(() => {
            this.setPermissions()

            return true

        }).catch((error) => {
            //this.handler.error(error)

            return false
        })
    },

    setPermissions() {
        this.isModerator = this.rank >= 2
    }

}
