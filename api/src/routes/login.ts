import { authenticateUser } from '../user/auth'

import { type FastifyPluginCallback } from 'fastify'
import { TraversalError } from 'arktype'

const login: FastifyPluginCallback = (app, _opts, done) => {
    app.post('/login', async (request, reply) => {
        try {
            const { user, error } = await authenticateUser(request.body)

            if (!user) {
                return reply.code(401).send({ error })
            }

            return reply.send({ success: true })

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

export default login
