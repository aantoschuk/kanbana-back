import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { HttpException, HttpStatus, Injectable} from "@nestjs/common";

@Injectable()
export class RateLimitService {
    constructor(@InjectRedis() private readonly redis: Redis) {}

    // 10 requests every 1 minute
    private limit = 10
    private windowMs = 60000

    private getKey(email: string, windowStart: number) {
        return `rate_limit:${email}:${windowStart}`
    }

    async check(email: string) {
        // crate start time amd a key
        const now = Date.now()
        const windowStart = now - (now % this.windowMs)
        const key = this.getKey(email, windowStart)

        // count how many requests a user made
        const count = await this.redis.incr(key)


        // if this is the first request, then set expiration time
        if(count === 1) {
            await this.redis.expire(key, this.windowMs / 1000 )
        }

        // if requests exceeeds limit throw an exception
        if(count > this.limit) {
            throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS)
        }

        return {allowed: true, count}

    }
}
