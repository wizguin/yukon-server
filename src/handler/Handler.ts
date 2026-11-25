import * as data from '@data'
import { config } from '@config'
import Database from '@database/Database'
import PluginManager from '@plugin/PluginManager'

import MatchmakerFactory from '@objects/room/matchmaker/MatchmakerFactory'
import OpenIgloos from '@objects/room/OpenIgloos'
import Room from '@objects/room/Room'
import TableFactory from '@objects/room/table/TableFactory'
import Waddle from '@objects/room/waddle/Waddle'

import type { Message } from '../server/Server'
import type User from '@objects/user/User'

import EventEmitter from 'events'
import { TraversalError } from 'arktype'

export default class Handler {

    id: string
    users: Record<string, User>

    events: EventEmitter
    plugins: PluginManager

    usersById: Record<string, User> = {}
    maxUsers: number
    rooms: Record<string, Room>
    openIgloos: OpenIgloos

    constructor(id: string, users: Record<string, User>) {
        this.id = id
        this.users = users

        this.events = new EventEmitter({ captureRejections: true })

        this.events.on('error', error => {
            this.handleError(error)
        })

        this.maxUsers = config.worlds[id].maxUsers || 300

        this.rooms = this.setRooms()
        this.openIgloos = new OpenIgloos()
        this.plugins = new PluginManager(this)

        this.setTables()
        this.setWaddles()
        this.setMatchmakers()

        this.updateWorldPopulation().catch(error => this.handleError(error))
    }

    setRooms() {
        const rooms: Record<number, Room> = {}

        for (const room of data.rooms) {
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

            room.matchmaker = MatchmakerFactory.createMatchmaker(data.matchmakers[id], room, this)
        }
    }

    handle(message: Message, user: User) {
        try {
            console.log(`[${this.id}] Received: ${message.action} ${JSON.stringify(message.args)}`)

            if (!user.authenticated && message.action !== 'game_auth') {
                user.close()
                return
            }

            if (message.action in config.cooldowns) {
                this.setCooldown(message, user)
            }

            this.events.emit(message.action, message.args, user)

            if (user.events) {
                user.events.emit(message.action, message.args, user)
            }

        } catch (error) {
            this.handleError(error)
        }
    }

    setCooldown({ action }: Message, user: User) {
        user.cooldowns[action] = Date.now()
    }

    isOnCooldown({ action }: Message, user: User) {
        if (!(action in config.cooldowns)) {
            return false
        }

        if (!(action in user.cooldowns)) {
            return false
        }

        const cooldown = config.cooldowns[action]
        const lastUsed = user.cooldowns[action]

        return Date.now() - lastUsed < cooldown
    }

    close(user: User) {
        try {
            if (!user) {
                return
            }

            if (user.pets) {
                user.pets.stopPetUpdate()
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

        } catch (error) {
            this.handleError(error)
        }
    }

    get joined() {
        return Object.values(this.users).filter(user => user.joinedServer)
    }

    get population() {
        return this.joined.length
    }

    closeAndUpdatePopulation(user: User) {
        delete this.users[user.socket.id]

        this.updateWorldPopulation().catch(error => this.handleError(error))
    }

    async updateWorldPopulation() {
        try {
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

        } catch (error) {
            this.handleError(error)
        }
    }

    handleError(error: unknown) {
        if (error instanceof TraversalError) {
            console.warn(`Event validation error: ${error.message}`)
            return
        }

        if (error instanceof Error) {
            this.logError(error)
            return
        }

        console.error(error)
    }

    private logError(error: Error) {
        console.error(`[${this.id}] ERROR: ${error.stack}`)
    }

}
