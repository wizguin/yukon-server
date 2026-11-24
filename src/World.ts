import Server from './server/Server'

import { config } from '@config'
import GameHandler from './handlers/GameHandler'
import redis from './redis/redis'

class World extends Server {

    constructor(id: string) {
        console.log(`[${id}] Starting world ${id} on port ${config.worlds[id].port}`)

        const users = {}

        const handler = new GameHandler(id, users)

        super(id, users, handler)
    }

}

async function start() {
    await redis.connect()

    const args = process.argv.slice(2)

    for (const world of args) {
        if (world in config.worlds) {
            new World(world)
        }
    }
}

start().catch(error => {
    console.error(error)
    process.exit(1)
})
