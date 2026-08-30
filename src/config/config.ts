import { loadJson } from '@utils/loadJson'

import { type } from 'arktype'

const Config = type({
    crypto: {
        secret: 'string',
        rounds: 'number',
        loginKeyExpiry: 'number'
    },

    cors: {
        origin: 'string'
    },

    rateLimit: {
        enabled: 'boolean',
        addressConnectsPerSecond: 'number',
        addressEventsPerSecond: 'number',
        userEventsPerSecond: 'number',
        ipAddressHeader: 'false | string'
    },

    worlds: {
        '[string]': {
            host: 'string',
            port: 'number',
            'maxUsers?': 'number'
        }
    },

    cooldowns: {
        '[string]': 'number'
    },

    game: {
        preferredSpawn: 'number',
        iglooIdOffset: 'number'
    }
})

export type Config = typeof Config.infer

export const config = Config.assert(loadJson('config/config'))
