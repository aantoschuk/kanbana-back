import { Module } from "@nestjs/common";

import { RateLimitService } from "./rate-limit.service";
import { RateLimitGuard } from "./rate-limit.guard";

@Module({
    imports: [],
    providers: [RateLimitService, RateLimitGuard],
    exports: [RateLimitGuard, RateLimitService],
})
export class RateLimitModule {}
