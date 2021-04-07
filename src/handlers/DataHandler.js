import Room from '../database/Room'
import PluginManager from '../plugins/PluginManager'


export default class DataHandler {

    constructor(users, db, config) {
        this.users = users
        this.usersById = {}
        this.db = db
        this.config = config

        this.init()
    }

    async init() {
        this.crumbs = {
            items: await this.db.getItems(),
            furnitures: await this.db.getFurnitures()
        }

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

                // Only allow game_auth until user is authenticated
                if (!user.authenticated && parsed.action != 'game_auth') return user.close()

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
        if (!user) return

        if (user.room) user.room.remove(user)
        if (user.buddy) user.buddy.sendOffline()
        if (user.data && user.data.id) delete this.usersById[user.data.id]

        delete this.users[user.socket.id]
    }

}
