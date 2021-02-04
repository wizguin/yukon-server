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
            this.compareLoginKey(args.loginKey, user)
        } else {
            user.send('error', { error: 'Penguin not found. Try Again?' })
            user.close()
        }
    }

    // Functions

    async compareLoginKey(loginKey, user) {
        if (loginKey == user.data.loginKey) {

            this.usersById[user.data.id] = user

            await user.setBuddies(await user.db.getBuddies(user.data.id))
            user.setInventory(await user.db.getInventory(user.data.id))

            user.send('login_key', { success: true })
        } else {
            user.send('error', { error: 'Incorrect password. NOTE: Passwords are CaSe SeNsiTIVE' })
            user.close()
        }
    }

}
