import Plugin from '../Plugin'


export default class Login extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'login': this.login
        }
    }

    // Events

    async login(args, user) {
        let userData = await user.db.getUserByUsername(args.username)

        if (userData) {
            user.data = userData
            this.compareLoginKey(args.loginKey, user)
        } else {
            user.send('error', { error: 'Penguin not found. Try Again?' })
        }
    }

    // Functions

    compareLoginKey(loginKey, user) {
        if (loginKey == user.data.loginKey) {
            delete user.data.dataValues.loginKey
            user.send('login', { success: true })
        } else {
            user.send('error', { error: 'Incorrect password. NOTE: Passwords are CaSe SeNsiTIVE' })
        }
    }

}
