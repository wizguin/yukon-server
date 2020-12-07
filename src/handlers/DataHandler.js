import Room from '../database/Room'
import PluginManager from '../plugins/PluginManager'


export default class DataHandler {

    constructor(users, db) {
        this.users = users
        this.db = db

        this.init()
    }

    async init() {
        // Crumbs
        this.items = await this.db.getItems()
        this.rooms = await this.setRooms()

        this.plugins = new PluginManager(this)
    }

    async setRooms() {
        let roomsData = await this.db.getRooms()
        let rooms = {}

        for (let data of roomsData) {
            rooms[data.id] = new Room(data)
        }

        return rooms
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
        if (user.data) user.room.remove(user)

        delete this.users[user.socket.id]
    }

}
