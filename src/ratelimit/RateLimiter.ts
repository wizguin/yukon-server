import type { Config } from '../config/config'
import { RateLimiterMemory } from 'rate-limiter-flexible'

export default class RateLimiter {

    addressConnects: RateLimiterMemory
    addressEvents: RateLimiterMemory
    userEvents: RateLimiterMemory

    constructor(config: Config) {
        this.addressConnects = this.createLimiter(config.rateLimit.addressConnectsPerSecond)
        this.addressEvents = this.createLimiter(config.rateLimit.addressEventsPerSecond)
        this.userEvents = this.createLimiter(config.rateLimit.userEventsPerSecond)
    }

    createLimiter(points: number) {
        return new RateLimiterMemory({
            points,
            duration: 1
        })
    }

}
