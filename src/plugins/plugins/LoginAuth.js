import Plugin from '../Plugin'


export default class LoginAuth extends Plugin {

    constructor(users, rooms) {
        super(users, rooms)
        this.events = {
            'login_key_auth': this.loginKeyAuth
        }
    }

    // Events

    loginKeyAuth(args, user) {

    }

    // Functions

}
