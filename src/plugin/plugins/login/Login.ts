import Plugin from '@plugin/Plugin'

import type { Args } from '../../../server/Server'
import { config } from '@config'
import type LoginHandler from '../../../handlers/LoginHandler'
import Database from '@database/Database'
import type User from '@objects/user/User'

import { hasProps, isLength, isString } from '@utils/validation'

import Validator, { type AsyncCheckFunction, type SyncCheckFunction } from 'fastest-validator'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

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
            login: this.login,
            token_login: this.tokenLogin
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

        const check = this.check({ username: args.username, password: args.password })

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
        const validator = new Validator()

        const schema = {
            username: {
                empty: false,
                trim: true,
                type: 'string',
                min: 4,
                max: 12,
                messages: {
                    stringEmpty: 'You must provide your Penguin Name to enter Club Penguin',
                    stringMin: 'Your Penguin Name is too short. Please try again',
                    stringMax: 'Your Penguin Name is too long. Please try again'
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
        const load = await user.load(args.username)
        if (!load) {
            return responses.notFound
        }

        const match = await bcrypt.compare(args.password, user.password)
        if (!match) {
            return responses.wrongPassword
        }

        const banned = this.checkBanned(user)
        if (banned) {
            return banned
        }

        return this.onLoginSuccess(user)
    }

    async compareTokens(args: Args, user: User) {
        if (!hasProps(args, 'username', 'token')) {
            return responses.wrongPassword
        }

        if (!isLength(args.username, 4, 12) || !isString(args.token)) {
            return responses.wrongPassword
        }

        const split = args.token.split(':')
        if (split.length != 2) {
            return responses.wrongPassword
        }

        const load = await user.load(args.username, split[0])
        if (!load) {
            return responses.notFound
        }

        if (!user.authToken) {
            return responses.wrongPassword
        }

        const match = await bcrypt.compare(split[1], user.authToken.validator)
        if (!match) {
            return responses.wrongPassword
        }

        const banned = this.checkBanned(user)
        if (banned) {
            return banned
        }

        return this.onLoginSuccess(user)
    }

    checkBanned(user: User) {
        if (user.permaBan) {
            return responses.permaBan
        }

        if (!user.ban) {
            return
        }

        const hours = Math.round((user.ban.expires.getTime() - Date.now()) / 60 / 60 / 1000)
        return {
            success: false,
            message: `Banned:\nYou are banned for the next ${hours} hours`
        }
    }

    async onLoginSuccess(user: User) {
        // Generate random key, used by client for authentication
        const randomKey = crypto.randomBytes(32).toString('hex')
        // Generate new login key, used to validate user on game server
        const loginKey = await this.genLoginKey(user, randomKey)

        const populations = await this.getWorldPopulations(user.isModerator)

        // All validation passed
        await user.update({ loginKey })

        return {
            success: true,
            username: user.username,
            key: randomKey,
            populations
        }
    }

    async genLoginKey(user: User, randomKey: string) {
        const hash = user.createLoginHash(randomKey)

        return jwt.sign({
            hash
        }, config.crypto.secret, { expiresIn: config.crypto.loginKeyExpiry })
    }

    async getWorldPopulations(isModerator: boolean) {
        const pops = await Database.world.findMany()
        const populations: Record<string, number> = {}

        for (const { id, population } of pops) {
            const maxUsers = config.worlds[id].maxUsers || 300

            if (population >= maxUsers) {
                populations[id] = isModerator ? 5 : 6
                continue
            }

            const barSize = Math.round(maxUsers / 5)
            const bars = Math.max(Math.ceil(population / barSize), 1) || 1

            populations[id] = bars
        }

        return populations
    }

}
