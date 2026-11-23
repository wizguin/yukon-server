import { authenticateUser } from '../user/auth'
import redis from '../../../src/redis/redis'
import type { User } from '../../../src/generated/prisma/client'

import { createHash, randomBytes } from 'crypto'
import { type FastifyPluginCallback } from 'fastify'
import { TraversalError } from 'arktype'

const login: FastifyPluginCallback = (app, _opts, done) => {
    app.post('/login', async (request, reply) => {
        try {
            const { user, error } = await authenticateUser(request.body)

            if (!user) {
                return reply.code(401).send({ error })
            }

            const loginKey = await setLoginKey(user)

            return reply.send({
                username: user.username,
                key: loginKey,
                populations: getWorldPopulations()
            })

        } catch (error) {
            if (error instanceof TraversalError) {
                return reply.code(400).send()
            }

            console.error(error)

            return reply.code(500).send()
        }
    })

    done()
}

async function setLoginKey(user: User) {
    const loginKey = randomBytes(32).toString('hex')
    const loginKeyHash = createHash('sha256').update(loginKey).digest('hex')

    await redis.set(`${user.id}:loginkey`, loginKeyHash, {
        EX: 300
    })

    return loginKey
}

function getWorldPopulations() {
    return {}
}

export default login
