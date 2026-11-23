import { authenticateUser } from '../user/auth'

import { type FastifyPluginCallback } from 'fastify'

const login: FastifyPluginCallback = (app, _opts, done) => {
    app.post('/login', async (request, reply) => {
        try {
            const result = await authenticateUser(request.body)

            if (!result.success) {
                return reply.code(400).send(result)
            }

            return reply.send({ success: true })

        } catch (error) {
            console.error(error)

            return reply.code(500).send({ success: false })
        }
    })

    done()
}

export default login
