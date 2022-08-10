import PluginManager from '../plugins/PluginManager'

import OpenIgloos from '../objects/room/OpenIgloos'
import Room from '../objects/room/Room'
import TableFactory from '../objects/room/table/TableFactory'

export default class GameHandler {

    constructor(id, users, db, config) {
        this.id = id
        this.users = users
        this.db = db
        this.config = config

        this.usersById = {}
        this.maxUsers = config.worlds[id].maxUsers

        this.openIgloos = new OpenIgloos()

        this.init()
    }

    async init() {
        this.crumbs = {
            items: await this.db.getItems(),
            igloos: await this.db.getIgloos(),
            furnitures: await this.db.getFurnitures(),
            floorings: await this.db.getFloorings()
        }

        this.rooms = await this.setRooms()
        await this.setTables()

        this.plugins = new PluginManager(this)

        this.updateWorldPopulation()
    }

    async setRooms() {
        let roomsData = await this.db.getRooms()
        let rooms = {}

        for (let data of roomsData) {
            rooms[data.id] = new Room(data)
        }

        return rooms
    }

    async setTables() {
        let tables = await this.db.getTables()

        for (let table of tables) {
            let room = this.rooms[table.roomId]
            this.rooms[table.roomId].tables[table.id] = TableFactory.createTable(table, room)
        }
    }

    handle(message, user) {
        message.split('\xdd').filter(Boolean).forEach(packet => {
            try {
                let parsed = JSON.parse(packet)
                console.log(`[GameHandler] Received: ${parsed.action} ${JSON.stringify(parsed.args)}`)

                // Only allow game_auth until user is authenticated
                if (!user.authenticated && parsed.action != 'game_auth') {
                    return user.close()
                }

                this.fireEvent(parsed.action, parsed.args, user)

            } catch(error) {
                console.error(`[GameHandler] Error: ${error}`)
            }
        })
    }

    fireEvent(event, args, user) {
        this.plugins.getEvent(event, args, user)
    }

    close(user) {
        if (!user || !user.authenticated) {
            return
        }

        if (user.room) {
            user.room.remove(user)
        }

        if (user.buddy) {
            user.buddy.sendOffline()
        }

        if (user.minigameRoom) {
            user.minigameRoom.remove(user)
        }

        if (user.data && user.data.id && user.data.id in this.usersById) {
            delete this.usersById[user.data.id]
        }

        if (user.data && user.data.id) {
            this.openIgloos.remove(user)
        }

        delete this.users[user.socket.id]

        this.updateWorldPopulation()
    }

    get population() {
        return Object.keys(this.users).length
    }

    async updateWorldPopulation() {
        this.db.worlds.update({ population: this.population }, { where: { id: this.id }})
    }

}
