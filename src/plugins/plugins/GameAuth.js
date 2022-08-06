import Plugin from '../Plugin'

import { hasProps } from '../../utils/validation'

import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'


export default class GameAuth extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)

        this.events = {
            'game_auth': this.gameAuth
        }
    }

    // Events

    async gameAuth(args, user) {
        if (!hasProps(args, 'username', 'key')) {
            return
        }

        // Already authenticated
        if (user.authenticated) {
            return
        }

        let userData = await user.db.getUserByUsername(args.username)
        if (!userData) {
            return user.close()
        }

        user.data = userData

        // Full server
        if (this.handler.population > this.handler.maxUsers && !user.isModerator) {
            return user.close()
        }

        // Check banned
        let activeBan = await user.db.getActiveBan(user.data.id)
        if (activeBan || user.data.permaBan) {
            return user.close()
        }

        // Confirm key length
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
            decoded = jwt.verify(user.data.loginKey, this.config.crypto.secret)
        } catch (err) {
            return user.close()
        }

        // Verify hash
        let address = user.socket.handshake.address
        let userAgent = user.socket.request.headers['user-agent']

        let digest = crypto.createHash('sha256').update(`${user.data.username}${args.key}${address}${userAgent}`).digest('hex')
        let match = await bcrypt.compare(digest, decoded.hash)

        if (!match) {
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
        if (user.data.id in this.usersById) {
            this.usersById[user.data.id].close()
        }

        // Success
        this.usersById[user.data.id] = user

        await user.setBuddies(await user.db.getBuddies(user.data.id))
        await user.setIgnores(await user.db.getIgnores(user.data.id))
        user.setInventory(await user.db.getInventory(user.data.id))
        user.setIglooInventory(await user.db.getIglooInventory(user.data.id))
        user.setFurnitureInventory(await user.db.getFurnitureInventory(user.data.id))

        user.authenticated = true

        // Send response
        user.send('game_auth', { success: true })
        if (token) {
            user.send('auth_token', { token: token })
        }

        // Update world population
        await this.handler.updateWorldPopulation()
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
