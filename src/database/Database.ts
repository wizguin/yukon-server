import { PrismaClient } from '../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const { hostname, port, username, password, pathname } = new URL(process.env.DATABASE_URL!)

const adapter = new PrismaMariaDb({
    host: hostname,
    port: Number(port),
    user: username,
    password,
    database: pathname.slice(1),
    allowPublicKeyRetrieval: true
})

export default new PrismaClient({ adapter })
