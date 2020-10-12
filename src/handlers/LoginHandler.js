/**
 * Dedicated login server handler that validates user credentials.
 */
export default class LoginHandler {

    constructor(users) {
        this.users = users
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

    login(args, user) {
        let username = args.username
        let password = args.password

        console.log(username, password)
    }

    validateUsername(username) {

    }

    validatePassword(password) {

    }

    comparePassword(password) {

    }

    close(user) {
        delete this.users[user.socket.id]
    }

}
