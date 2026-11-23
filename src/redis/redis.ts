import { createClient } from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

const redis = createClient({ url: redisUrl })

redis.on('error', error => console.error(error))
redis.on('connect', () => console.log('Connected to redis'))

export default redis
