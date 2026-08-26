import GamePlugin from '@plugin/GamePlugin'

import { config } from '@config'
import type GameHandler from '../../../handlers/GameHandler'
import type GameUser from '@objects/user/GameUser'

import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { type } from 'arktype'
import { v4 as uuid } from 'uuid'

interface LoginKeyPayload extends jwt.JwtPayload {
    hash: string
}

const Auth = type({
    username: '4 <= string <= 12',
    key: 'string == 64',
    'token?': 'string == 36',
    'createToken?': 'boolean'
})

export default class GameAuth extends GamePlugin {

    constructor(handler: GameHandler) {
        super(handler)

        this.events = {
            game_auth: this.gameAuth
        }
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
        const load = await user.load(username)

        if (!load) {
            return user.close()
        }

        // @ts-expect-error temp
        if (this.handler.population >= this.handler.maxUsers && !user.isModerator) {
            return user.close()
        }

        if (user.ban || user.permaBan) {
            return user.close()
        }

        this.compareLoginKey(user, key, token, createToken)
    }

    async compareLoginKey(user: GameUser, key: string, token?: string, createToken?: boolean) {
        if (!user.loginKey) {
            return user.close()
        }

        let decoded: LoginKeyPayload

        // Verify JWT
        try {
            decoded = jwt.verify(user.loginKey, config.crypto.secret) as LoginKeyPayload
        } catch {
            return user.close()
        }

        // Verify hash
        const hash = user.createLoginHash(key)

        if (decoded.hash !== hash) {
            return user.close()
        }

        // Remove login key from database
        user.update({ loginKey: null })

        // Set selector for token destruction
        if (token) {
            user.token.oldSelector = token
        }

        // Disconnect if already logged in
        if (user.id in this.usersById) {
            this.usersById[user.id].close()
        }

        // Success
        this.usersById[user.id] = user

        user.authenticated = true

        // Send response
        const response: { success: boolean, token?: string } = { success: true }

        // Create new token
        if (createToken) {
            response.token = await this.genAuthToken(user)
        }

        user.send('game_auth', response)
    }

    async genAuthToken(user: GameUser) {
        const selector = uuid()
        const validator = crypto.randomBytes(32).toString('hex')
        const validatorHash = await bcrypt.hash(validator, config.crypto.rounds)

        user.token.selector = selector
        user.token.validatorHash = validatorHash

        return `${selector}:${validator}`
    }

}
