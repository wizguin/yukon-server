import redis from '../../src/redis/redis'

import fastify from 'fastify'
import fastifyAutoload from '@fastify/autoload'
import { join } from 'path'

const app = fastify({
    routerOptions: {
        ignoreDuplicateSlashes: true,
        ignoreTrailingSlash: true
    }
})

const port = Number(process.env.API_PORT || 6111)

app.register(fastifyAutoload, {
    dir: join(__dirname, 'routes')
})

async function start() {
    await redis.connect()

    await app.listen({ host: '0.0.0.0', port })

    console.log(`Listening on port ${port}`)
}

start().catch(error => {
    console.error(error)
    process.exit(1)
})
