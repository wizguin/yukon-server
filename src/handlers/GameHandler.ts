import BaseHandler from './BaseHandler'

import { config } from '@config'
import MatchmakerFactory from '@objects/room/matchmaker/MatchmakerFactory'
import OpenIgloos from '@objects/room/OpenIgloos'
import Room from '@objects/room/Room'
import TableFactory from '@objects/room/table/TableFactory'
import Waddle from '@objects/room/waddle/Waddle'

import type GameUser from '@objects/user/GameUser'
import type { Message } from '../server/Server'

import * as data from '@data'
import Database from '@database/Database'

export default class GameHandler extends BaseHandler {

    crumbs: any
    usersById: Record<string, GameUser> = {}
    maxUsers: number
    rooms: Record<string, Room>
    openIgloos: OpenIgloos

    constructor(
        public id: string,
        public users: Record<string, GameUser>
    ) {
        super(id, users)

        this.crumbs = {
            items: data.items,
            igloos: data.igloos,
            furnitures: data.furniture,
            floorings: data.flooring,
            cards: data.cards
        }

        this.maxUsers = config.worlds[id].maxUsers || 300

        this.rooms = this.setRooms()

        this.setTables()
        this.setWaddles()
        this.setMatchmakers()

        this.openIgloos = new OpenIgloos()

        this.startPlugins('/game')

        this.updateWorldPopulation()
    }

    setRooms() {
        const rooms = {}

        for (const room of data.rooms) {
            // @ts-expect-error temp
            rooms[room.id] = new Room(room)
        }

        return rooms
    }

    setTables() {
        for (const table of data.tables) {
            const room = this.rooms[table.roomId]

            room.tables[table.id] = TableFactory.createTable(table, room)
        }
    }

    setWaddles() {
        for (const waddle of data.waddles) {
            this.rooms[waddle.roomId].waddles[waddle.id] = new Waddle(waddle)
        }
    }

    setMatchmakers() {
        for (const id in data.matchmakers) {
            const room = this.rooms[id]

            room.matchmaker = MatchmakerFactory.createMatchmaker(data.matchmakers[id], room)
        }
    }

    handleGuard(message: Message, user: GameUser) {
        return !user.authenticated && message.action != 'game_auth'
    }

    close(user: GameUser) {
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

            if (user.pets) {
                user.pets.stopPetUpdate()
            }

            this.closeAndUpdatePopulation(user)
        } catch (error) {
            if (error instanceof Error) {
                this.error(error)
            }
        }
    }

    get joined() {
        return Object.values(this.users).filter(user => user.joinedServer)
    }

    get population() {
        return this.joined.length
    }

    closeAndUpdatePopulation(user: GameUser) {
        super.close(user)

        this.updateWorldPopulation()
    }

    async updateWorldPopulation() {
        await Database.world.upsert({
            where: {
                id: this.id
            },
            update: {
                population: this.population
            },
            create: {
                id: this.id,
                population: this.population
            }
        })
    }

}
