import PluginManager from '../plugins/PluginManager'
import rooms from '../config/rooms.json'


export default class DataHandler {

    constructor(users) {
        this.users = users

        this.rooms = rooms

        this.plugins = new PluginManager(this)
    }

    handle(message, user) {
        message.split('\xdd').filter(Boolean).forEach(packet => {
            try {
                let parsed = JSON.parse(packet)
                console.log(`[DataHandler] Received: ${parsed.action} ${JSON.stringify(parsed.args)}`)
                this.fireEvent(parsed.action, parsed.args, user)

            } catch(error) {
                console.error(`[DataHandler] Error: ${error}`)
            }
        })
    }

    fireEvent(event, args, user) {
        this.plugins.getEvent(event, args, user)
    }

    close(user) {
        if (user.data) {
            this.sendRoom(user, 'remove_player', { user: user.data.id })
            delete this.rooms[user.room].users[user.socket.id]
        }

        delete this.users[user.socket.id]
    }

    sendRoom(user, action, args = {}) {
        for (let u of Object.values(this.rooms[user.room].users)) {
            if (u != user) u.send(action, args)
        }
    }

}
