import BaseHandler from './BaseHandler'

import MatchmakerFactory from '@objects/room/matchmaker/MatchmakerFactory'
import OpenIgloos from '@objects/room/OpenIgloos'
import Room from '@objects/room/Room'
import TableFactory from '@objects/room/table/TableFactory'
import Waddle from '@objects/room/waddle/Waddle'

import data from '@data/data'


export default class GameHandler extends BaseHandler {

    constructor(id, users, db, config) {
        super(id, users, db, config)

        this.crumbs = {
            items: data.items,
            igloos: data.igloos,
            furnitures: data.furnitures,
            floorings: data.floorings,
            cards: data.cards
        }

        this.usersById = {}
        this.maxUsers = config.worlds[id].maxUsers

        this.rooms = this.setRooms()

        this.setTables()
        this.setWaddles()
        this.setMatchmakers()

        this.openIgloos = new OpenIgloos()

        this.startPlugins('/game')

        this.updateWorldPopulation()
    }

    setRooms() {
        let rooms = {}

        for (let room of data.rooms) {
            rooms[room.id] = new Room(room)
        }

        return rooms
    }

    setTables() {
        for (let table of data.tables) {
            let room = this.rooms[table.roomId]

            room.tables[table.id] = TableFactory.createTable(table, room)
        }
    }

    setWaddles() {
        for (let waddle of data.waddles) {
            this.rooms[waddle.roomId].waddles[waddle.id] = new Waddle(waddle)
        }
    }

    setMatchmakers() {
        for (let id in data.matchmakers) {
            let room = this.rooms[id]

            room.matchmaker = MatchmakerFactory.createMatchmaker(data.matchmakers[id], room)
        }
    }

    handleGuard(message, user) {
        return !user.authenticated && message.action != 'game_auth'
    }

    close(user) {
        try {
            if (!user) {
                return
            }

            if (!user.authenticated) {
                return this.closeAndUpdatePopulation(user)
            }

            if (user.room) {
                user.room.remove(user)
            }

            if (user.buddies) {
                user.buddies.sendOffline()
            }

            if (user.waddle) {
                user.waddle.remove(user)
            }

            if (user.minigameRoom) {
                user.minigameRoom.remove(user)
            }

            if (user.id && user.id in this.usersById) {
                delete this.usersById[user.id]
            }

            if (user.id) {
                this.openIgloos.remove(user)
            }

            this.closeAndUpdatePopulation(user)
        }
        catch (error) {
            this.error(error)
        }
    }

    get joined() {
        return Object.values(this.users).filter(user => user.joinedServer)
    }

    get population() {
        return this.joined.length
    }

    closeAndUpdatePopulation(user) {
        super.close(user)

        this.updateWorldPopulation()
    }

    updateWorldPopulation() {
        this.db.worlds.update({ population: this.population }, { where: { id: this.id }})
    }

}
