import getSocketAddress from './getSocketAddress'
import pick from '@utils/pick'

import crypto from 'crypto'
import { Op } from 'sequelize'


export default class User {

    constructor(server, socket) {
        this.server = server
        this.socket = socket

        this.db = server.db
        this.handler = server.handler
        this.config = server.config

        this.address = getSocketAddress(socket, this.config)

        this.loginSent = false
        this.isModerator = false

        // Events on cooldown
        this.cooldowns = {}
    }

    send(action, args = {}) {
        this.socket.emit('message', { action: action, args: args })
    }

    close() {
        this.socket.disconnect(true)
    }

    getId() {
        return this.id ? this.id : this.socket.id
    }

    createLoginHash(randomKey) {
        const userAgent = this.socket.request.headers['user-agent']
        const string = `${this.username}${randomKey}${this.address}${userAgent}`

        return crypto.createHash('sha256').update(string).digest('hex')
    }

    async load(username, selector = null) {
        try {
            const user = await this.db.users.findOne({
                where: {
                    username
                },

                include: [
                    {
                        model: this.db.authTokens,
                        as: 'authToken',
                        where: {
                            selector
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
            })

            if (!user) {
                return false
            }

            Object.assign(this, user.get({ plain: true }))

            this.setPermissions()

            return true

        } catch (error) {
            this.handler.error(error)

            return false
        }
    }

    async update(updates) {
        if (!this.id) {
            return
        }

        Object.assign(this, updates)

        return this.db.users.update(updates, { where: { id: this.id } })
    }

    setPermissions() {
        this.isModerator = this.rank >= 2
    }

    get anonymous() {
        return pick(this,
            'id',
            'username',
            'head',
            'face',
            'neck',
            'body',
            'hand',
            'feet',
            'color',
            'photo',
            'flag',
        )
    }

}
