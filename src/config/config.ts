import { loadJson } from '@utils/loadJson'

import { type } from 'arktype'

const Config = type({
    crypto: {
        authTokenHashRounds: 'number.integer'
    },

    cors: {
        origin: 'string'
    },

    rateLimit: {
        enabled: 'boolean',
        addressConnectsPerSecond: 'number.integer',
        addressEventsPerSecond: 'number.integer',
        userEventsPerSecond: 'number.integer',
        ipAddressHeader: 'false | string'
    },

    worlds: {
        '[string]': {
            host: 'string',
            port: 'number.integer',
            'maxUsers?': 'number.integer'
        }
    },

    cooldowns: {
        '[string]': 'number.integer'
    },

    game: {
        preferredSpawn: 'number.integer',
        iglooIdOffset: 'number.integer'
    }
})

export type Config = typeof Config.infer

export const config = Config.assert(loadJson('config/config'))
