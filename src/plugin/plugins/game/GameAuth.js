import GamePlugin from '@plugin/GamePlugin'

import { hasProps } from '@utils/validation'

import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'


export default class GameAuth extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'game_auth': this.gameAuth
        }
    }

    // Events

    async gameAuth(args, user) {
        if (!hasProps(args, 'username', 'key')) {
            return
        }

        if (user.authenticated) {
            return
        }

        let load = await user.load(args.username)
        if (!load) {
            return user.close()
        }

        if (this.handler.population >= this.handler.maxUsers && !user.isModerator) {
            return user.close()
        }

        if (user.ban || user.permaBan) {
            return user.close()
        }

        if (args.key.length != 64) {
            return user.close()
        }

        this.compareLoginKey(args, user)
    }

    // Functions

    async compareLoginKey(args, user) {
        let decoded
        let token

        // Verify JWT
        try {
            decoded = jwt.verify(user.loginKey, this.config.crypto.secret)
        } catch (err) {
            return user.close()
        }

        // Verify hash
        let hash = user.createLoginHash(args.key)
        if (decoded.hash != hash) {
            return user.close()
        }

        // Remove login key from database
        user.update({ loginKey: null })

        // Set selector for token destruction
        if (args.token) {
            user.token.oldSelector = args.token
        }

        // Create new token
        if (args.createToken) {
            token = await this.genAuthToken(user)
        }

        // Disconnect if already logged in
        if (user.id in this.usersById) {
            this.usersById[user.id].close()
        }

        // Success
        this.usersById[user.id] = user

        user.authenticated = true

        // Send response
        let response = { success: true }
        if (token) {
            response.token = token
        }

        user.send('game_auth', response)
    }

    async genAuthToken(user) {
        let selector = uuid()
        let validator = crypto.randomBytes(32).toString('hex')
        let validatorHash = await bcrypt.hash(validator, this.config.crypto.rounds)

        user.token.selector = selector
        user.token.validatorHash = validatorHash

        return `${selector}:${validator}`
    }

}
