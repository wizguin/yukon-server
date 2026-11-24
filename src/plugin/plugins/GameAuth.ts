import GamePlugin from '@plugin/GamePlugin'

import { config } from '@config'
import type GameUser from '@objects/user/GameUser'
import redis from '../../redis/redis'

import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { type } from 'arktype'
import { v4 as uuid } from 'uuid'

const Auth = type({
    username: '4 <= string <= 12',
    key: 'string == 64',
    'token?': 'string == 36',
    'createToken?': 'boolean'
})

export default class GameAuth extends GamePlugin {

    events = {
        game_auth: this.gameAuth
    }

    async gameAuth(args: unknown, user: GameUser) {
        if (user.gameAuthSent || user.authenticated) {
            return user.close()
        }

        // Only handle game_auth once
        user.gameAuthSent = true

        let auth: ReturnType<typeof Auth.assert>

        try {
            auth = Auth.assert(args)
        } catch {
            return user.close()
        }

        const { username, key, token, createToken } = auth

        const isAuthenticated = await this.authenticateUser(user, username, key)

        if (!isAuthenticated || !user.socket.connected) {
            user.close()
            return
        }

        await this.onAuthSuccess(user, token, createToken)
    }

    async authenticateUser(user: GameUser, username: string, key: string) {
        const isLoaded = await user.load(username)

        if (!isLoaded || !user.socket.connected) {
            return false
        }

        // @ts-expect-error temp
        if (this.handler.population >= this.handler.maxUsers && !user.isModerator) {
            return false
        }

        if (user.ban || user.permaBan) {
            return false
        }

        const loginKeyHash = await redis.get(`${user.id}:loginkey`)

        if (!loginKeyHash) {
            return false
        }

        const hash = crypto.createHash('sha256').update(key).digest('hex')

        return loginKeyHash === hash
    }

    async onAuthSuccess(user: GameUser, token?: string, createToken?: boolean) {
        await redis.del(`${user.id}:loginkey`)

        user.authenticated = true

        // Set selector for token destruction
        if (token) {
            user.token.oldSelector = token
        }

        this.updateUsers(user)

        const response: { success: boolean, token?: string } = { success: true }

        if (createToken) {
            response.token = await this.genAuthToken(user)
        }

        if (!user.socket.connected) {
            return
        }

        user.pets.startPetUpdate()
        user.send('game_auth', response)
    }

    updateUsers(user: GameUser) {
        if (user.id in this.usersById) {
            this.usersById[user.id].close()
        }

        this.usersById[user.id] = user
    }

    async genAuthToken(user: GameUser) {
        const selector = uuid()
        const validator = crypto.randomBytes(32).toString('hex')
        const validatorHash = await bcrypt.hash(validator, config.crypto.authTokenHashRounds)

        user.token.selector = selector
        user.token.validatorHash = validatorHash

        return `${selector}:${validator}`
    }

}
