import Plugin from '@plugin/Plugin'

import type { Args } from '../../../server/Server'
import type LoginHandler from '../../../handlers/LoginHandler'
import type User from '@objects/user/User'

import { hasProps, isLength, isString } from '@utils/validation'

import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import Validator, { type AsyncCheckFunction, type SyncCheckFunction } from 'fastest-validator'


const responses = {
    notFound: {
        success: false,
        message: 'Penguin not found. Try Again?'
    },
    wrongPassword: {
        success: false,
        message: 'Incorrect password. NOTE: Passwords are CaSe SeNsiTIVE'
    },
    permaBan: {
        success: false,
        message: 'Banned:\nYou are banned forever'
    }
}

export default class Login extends Plugin {

    check: AsyncCheckFunction | SyncCheckFunction

    constructor(handler: LoginHandler) {
        super(handler)

        this.events = {
            'login': this.login,
            'token_login': this.tokenLogin
        }

        this.check = this.createValidator()
    }

    // Events

    async login(args: Args, user: User) {
        if (user.loginSent) {
            return user.close()
        }

        // Only handle login once
        user.loginSent = true

        let check = this.check({ username: args.username, password: args.password })

        if (check != true) {
            // Invalid data input
            user.send('login', {
                success: false,
                // @ts-expect-error temp
                message: check[0].message
            })

        } else {
            // Comparing password and checking for user existence
            user.send('login', await this.comparePasswords(args, user))
        }

        user.close()
    }

    async tokenLogin(args: Args, user: User) {
        if (user.loginSent) {
            return user.close()
        }

        // Only handle login once
        user.loginSent = true

        user.send('login', await this.compareTokens(args, user))
        user.close()
    }

    // Functions

    createValidator() {
        let validator = new Validator()

        let schema = {
            username: {
                empty: false,
                trim: true,
                type: 'string',
                min: 4,
                max: 12,
                messages: {
                    stringEmpty: 'You must provide your Penguin Name to enter Club Penguin',
                    stringMin: 'Your Penguin Name is too short. Please try again',
                    stringMax: 'Your Penguin Name is too long. Please try again',
                }
            },
            password: {
                empty: false,
                trim: true,
                type: 'string',
                min: 3,
                max: 128,
                messages: {
                    stringEmpty: 'You must provide your password to enter Club Penguin',
                    stringMin: 'Your password is too short. Please try again',
                    stringMax: 'Your password is too long. Please try again'
                }
            }
        }

        return validator.compile(schema)
    }

    async comparePasswords(args: Args, user: User) {
        let load = await user.load(args.username)
        if (!load) {
            return responses.notFound
        }

        let match = await bcrypt.compare(args.password, user.password)
        if (!match) {
            return responses.wrongPassword
        }

        let banned = this.checkBanned(user)
        if (banned) {
            return banned
        }

        return await this.onLoginSuccess(user)
    }

    async compareTokens(args: Args, user: User) {
        if (!hasProps(args, 'username', 'token')) {
            return responses.wrongPassword
        }

        if (!isLength(args.username, 4, 12) || !isString(args.token)) {
            return responses.wrongPassword
        }

        let split = args.token.split(':')
        if (split.length != 2) {
            return responses.wrongPassword
        }

        let load = await user.load(args.username, split[0])
        if (!load) {
            return responses.notFound
        }

        if (!user.authToken) {
            return responses.wrongPassword
        }

        let match = await bcrypt.compare(split[1], user.authToken.validator)
        if (!match) {
            return responses.wrongPassword
        }

        let banned = this.checkBanned(user)
        if (banned) {
            return banned
        }

        return await this.onLoginSuccess(user)
    }

    checkBanned(user: User) {
        if (user.permaBan) {
            return responses.permaBan
        }

        if (!user.ban) {
            return
        }

        let hours = Math.round((user.ban.expires - Date.now()) / 60 / 60 / 1000)
        return {
            success: false,
            message: `Banned:\nYou are banned for the next ${hours} hours`
        }
    }

    async onLoginSuccess(user: User) {
        // Generate random key, used by client for authentication
        let randomKey = crypto.randomBytes(32).toString('hex')
        // Generate new login key, used to validate user on game server
        let loginKey = await this.genLoginKey(user, randomKey)

        let populations = await this.getWorldPopulations(user.isModerator)

        // All validation passed
        await user.update({ loginKey })

        return {
            success: true,
            username: user.username,
            key: randomKey,
            populations: populations
        }
    }

    async genLoginKey(user: User, randomKey: string) {
        let hash = user.createLoginHash(randomKey)

        return jwt.sign({
            hash: hash
        }, this.config.crypto.secret, { expiresIn: this.config.crypto.loginKeyExpiry })
    }

    async getWorldPopulations(isModerator: boolean) {
        let pops = await this.db.getWorldPopulations()
        let populations: Record<string, number> = {}

        for (let world of Object.keys(pops)) {
            let maxUsers = this.config.worlds[world].maxUsers || 300
            let population = pops[world].population

            if (population >= maxUsers) {
                populations[world] = (isModerator) ? 5 : 6
                continue
            }

            let barSize = Math.round(maxUsers / 5)
            let bars = Math.max(Math.ceil(population / barSize), 1) || 1

            populations[world] = bars
        }

        return populations
    }

}
