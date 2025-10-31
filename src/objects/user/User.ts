import type { Action, Args } from '../../server/Server'
import type AuthTokens from '@database/models/AuthTokens'
import type Bans from '@database/models/Bans'
import type BaseHandler from '../../handlers/BaseHandler'
import type { Config } from '../../config/config'
import type Database from '@database/Database'
import type Server from '../../server/Server'
import type Users from '@database/models/Users'

import getSocketAddress from './getSocketAddress'
import pick from '@utils/pick'

import crypto from 'crypto'
import type { EventEmitter } from 'stream'
import { Op } from 'sequelize'
import type { Socket } from 'socket.io'

export default class User {

    db: Database
    handler: BaseHandler
    config: Config

    address: string
    loginSent = false
    isModerator = false

    events: EventEmitter | null = null
    cooldowns: Record<string, number> = {}

    id!: number
    username!: string
    password!: string
    loginKey!: string | null
    rank!: number
    permaBan!: boolean
    joinTime!: number
    coins!: number
    head!: number
    face!: number
    neck!: number
    body!: number
    hand!: number
    feet!: number
    color!: number
    photo!: number
    flag!: number
    ninjaRank!: number
    ninjaProgress!: number

    authToken!: AuthTokens
    ban!: Bans

    constructor(server: Server, public socket: Socket) {
        this.db = server.db
        this.handler = server.handler
        this.config = server.config

        this.address = getSocketAddress(socket, this.config)
    }

    send(action: Action, args: Args = {}) {
        this.socket.emit('message', { action, args })
    }

    close() {
        this.socket.disconnect(true)
    }

    getId() {
        return this.id ? this.id : this.socket.id
    }

    createLoginHash(randomKey: string) {
        const userAgent = this.socket.request.headers['user-agent']
        const string = `${this.username}${randomKey}${this.address}${userAgent}`

        return crypto.createHash('sha256').update(string).digest('hex')
    }

    async load(username: string, selector: string | null = null) {
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
            if (error instanceof Error) {
                this.handler.error(error)
            }

            return false
        }
    }

    async update(updates: Partial<Users>) {
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
            'flag'
        )
    }

}
