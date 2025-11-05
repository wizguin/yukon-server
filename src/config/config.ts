import { loadJson } from '@utils/loadJson'

import type { Assert } from 'ts-runtime-checks'
import type { Dialect } from 'sequelize'

export interface Config {
    crypto: {
        secret: string
        rounds: number
        loginKeyExpiry: number
    }
    database: {
        host: string
        user: string
        password: string
        database: string
        dialect: Dialect
        debug: boolean
        logQueryParameters: boolean
    }
    socketio: {
        https: boolean
        ssl: {
            cert: string
            ca: string
            key: string
        }
    }
    cors: {
        origin: string
    }
    rateLimit: {
        enabled: boolean
        addressConnectsPerSecond: number
        addressEventsPerSecond: number
        userEventsPerSecond: number
        ipAddressHeader: false | string
    }
    worlds: Record<string, {
        host: string
        port: number
        maxUsers?: number
    }>
    cooldowns: Record<string, number>
    game: {
        preferredSpawn: number
        iglooIdOffset: number
    }
}

export const config = loadJson('config/config') as Assert<Config>
