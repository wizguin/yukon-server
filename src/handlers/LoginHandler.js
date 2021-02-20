import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import Validator from 'fastest-validator'


/**
 * Dedicated login server handler that validates user credentials.
 */
export default class LoginHandler {

    constructor(users, db, config) {
        this.users = users
        this.db = db
        this.config = config.crypto

        this.check = this.createValidator()
    }

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

    handle(message, user) {
        message.split('\xdd').filter(Boolean).forEach(packet => {
            try {
                let parsed = JSON.parse(packet)
                if (parsed.action == 'login') this.login(parsed.args, user)

            } catch(error) {
                console.error(`[DataHandler] Error: ${error}`)
            }
        })
    }

    async login(args, user) {
        let check = this.check({ username: args.username, password: args.password })

        if (check != true) {
            // Invalid data input
            user.send('login', {
                success: false,
                message: check[0].message
            })

        } else {
            // Comparing password and checking for user existence
            user.send('login', await this.comparePasswords(args.username, args.password, user.socket))
        }

        user.close()
    }

    async comparePasswords(username, password, socket) {
        let user = await this.db.getUserByUsername(username)
        if (!user) {
            return {
                success: false,
                message: 'Penguin not found. Try Again?'
            }
        }

        let match = await bcrypt.compare(password, user.password)
        if (!match) {
            return {
                success: false,
                message: 'Incorrect password. NOTE: Passwords are CaSe SeNsiTIVE'
            }
        }

        // Generate new login key, used to validate user on game server
        let loginKey = crypto.randomBytes(32).toString('hex')
        let address = socket.handshake.address
        let userAgent = socket.request.headers['user-agent']

        // Create hash of login key and user data
        let hash = await bcrypt.hash(`${user.username}${loginKey}${address}${userAgent}`, this.config.rounds)

        // JWT to be stored on database
        user.loginKey = jwt.sign({
            hash: hash
        }, this.config.secret, { expiresIn: this.config.loginKeyExpiry })

        await user.save()

        // All validation passed
        return {
            success: true,
            username: username,
            loginKey: loginKey
        }
    }

    close(user) {
        delete this.users[user.socket.id]
    }

}
