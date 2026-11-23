import { type FastifyPluginCallback } from 'fastify'

const login: FastifyPluginCallback = (app, _opts, done) => {
    app.post<{
        Body: {
            username: string
            password: string
        }
    }>('/login', request => {
        console.log(request.body)
    })

    done()
}

export default login
