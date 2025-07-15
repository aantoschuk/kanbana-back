import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

import { RateLimitService } from "./rate-limit.service";

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(private readonly rateLimiService: RateLimitService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const email = req.user?.email;

        // block anonymous
        if (!email) return false;
        await this.rateLimiService.check(email);
        // Headers for rate limiting 
        // res.setHeader('X-RateLimit-Limit', request limit);
        // res.setHeader('X-RateLimit-Remaining', how many requests left);
        // res.setHeader('X-RateLimit-Reset', when limit is resets); // timestamp in ms

        return true;
    }
}

// Fixed window rate limiting techinique
