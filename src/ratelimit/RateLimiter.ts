import { RateLimiterMemory } from 'rate-limiter-flexible'


export default class RateLimiter {

    constructor(config) {
        this.addressConnects = this.createLimiter(config.rateLimit.addressConnectsPerSecond)
        this.addressEvents = this.createLimiter(config.rateLimit.addressEventsPerSecond)
        this.userEvents = this.createLimiter(config.rateLimit.userEventsPerSecond)
    }

    createLimiter(points) {
        return new RateLimiterMemory({
            points: points,
            duration: 1
        })
    }

}
