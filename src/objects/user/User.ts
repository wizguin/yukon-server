import type { Action, Args } from '../../server/Server'
import type { AuthToken, Ban } from '../../generated/prisma/client'
import type BaseHandler from '../../handlers/BaseHandler'
import type Database from '@database/Database'
import PrismaDatabase from '@database/PrismaDatabase'
import type Server from '../../server/Server'
import type Users from '@database/models/Users'

import getSocketAddress from './getSocketAddress'
import pick from '@utils/pick'

import crypto from 'crypto'
import type { EventEmitter } from 'stream'
import type { Socket } from 'socket.io'

export default class User {

    db: Database
    handler: BaseHandler

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

    authToken: AuthToken | null = null
    ban: Ban | null = null

    constructor(server: Server, public socket: Socket) {
        this.db = server.db
        this.handler = server.handler

        this.address = getSocketAddress(socket)
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

    async load(username: string, selector: string | undefined = undefined) {
        try {
            const user = await PrismaDatabase.user.findFirst({
                where: {
                    username
                },
                include: {
                    authTokens: {
                        where: {
                            selector
                        }
                    },
                    bans: {
                        where: {
                            expires: {
                                gt: new Date()
                            }
                        },
                        take: 1
                    }
                }
            })

            if (!user) {
                return false
            }

            const { authTokens, bans, ...rest } = user

            Object.assign(this, rest)

            this.authToken = authTokens[0] ?? null
            this.ban = bans[0] ?? null

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
