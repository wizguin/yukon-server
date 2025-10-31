import Database from './database/Database'
import GameHandler from './handlers/GameHandler'
import LoginHandler from './handlers/LoginHandler'
import Server from './server/Server'

import config from '../config/config.json'
import type { Config } from './config/config'

const conf = config as Config

class World extends Server {

    constructor(id: string) {
        console.log(`[${id}] Starting world ${id} on port ${conf.worlds[id].port}`)

        const users = {}
        const db = new Database(conf.database)

        const handlerClass = id === 'Login' ? LoginHandler : GameHandler
        const handler = new handlerClass(id, users, db, conf)

        super(id, users, db, handler, conf)
    }

}

const args = process.argv.slice(2)

for (const world of args) {
    if (world in config.worlds) {
        new World(world)
    }
}
