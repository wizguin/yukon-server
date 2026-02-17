import Server from './server/Server'

import { config } from '@config'
import GameHandler from './handlers/GameHandler'
import LoginHandler from './handlers/LoginHandler'

class World extends Server {

    constructor(id: string) {
        console.log(`[${id}] Starting world ${id} on port ${config.worlds[id].port}`)

        const users = {}

        const handlerClass = id === 'Login' ? LoginHandler : GameHandler
        const handler = new handlerClass(id, users)

        super(id, users, handler)
    }

}

const args = process.argv.slice(2)

for (const world of args) {
    if (world in config.worlds) {
        new World(world)
    }
}
