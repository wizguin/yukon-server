import bcrypt from 'bcrypt'
import crypto from 'crypto'
import Validator from 'fastest-validator'


/**
 * Dedicated login server handler that validates user credentials.
 */
export default class LoginHandler {

    constructor(users, db) {
        this.users = users
        this.db = db

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
            user.send('login', await this.comparePasswords(args.username, args.password))
        }

        user.close()
    }

    async comparePasswords(username, password) {
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
        user.loginKey = crypto.randomBytes(20).toString('hex')
        await user.save()

        // All validation passed
        return {
            success: true,
            username: username,
            loginKey: user.loginKey
        }
    }

    close(user) {
        delete this.users[user.socket.id]
    }

}
