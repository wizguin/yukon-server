import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import Plugin from '../Plugin'


export default class LoginKey extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'login_key': this.loginKey
        }
    }

    // Events

    async loginKey(args, user) {
        let userData = await user.db.getUserByUsername(args.username)

        if (userData) {
            user.data = userData
            this.compareLoginKey(user, args.loginKey)
        } else {
            user.close()
        }
    }

    // Functions

    async compareLoginKey(user, loginKey) {
        let decoded

        // Verify JWT
        try {
            decoded = jwt.verify(user.data.loginKey, this.config.crypto.secret)
        } catch (err) {
            return user.close()
        }

        // Verify hash
        let address = user.socket.handshake.address
        let userAgent = user.socket.request.headers['user-agent']
        let match = await bcrypt.compare(`${user.data.username}${loginKey}${address}${userAgent}`, decoded.hash)

        if (!match) return user.close()

        // Remove from database
        user.update({ loginKey: null })

        // Success
        this.usersById[user.data.id] = user

        await user.setBuddies(await user.db.getBuddies(user.data.id))
        await user.setIgnores(await user.db.getIgnores(user.data.id))
        user.setInventory(await user.db.getInventory(user.data.id))

        user.authenticated = true
        user.send('login_key', { success: true })
    }

}
