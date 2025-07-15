import { Redis } from "ioredis";
import { Controller, Get } from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { RedisHealthIndicator } from "@liaoliaots/nestjs-redis-health";

import {
    HealthCheck,
    HealthCheckResult,
    HealthCheckService,
} from "@nestjs/terminus";

import { AppService } from "./app.service";

@Controller()
export class AppController {
   @InjectRedis() private readonly redis: Redis;

    constructor(
        private readonly appService: AppService,
        private readonly health: HealthCheckService,
        private readonly redisIndicator: RedisHealthIndicator,
    ) {}

    @Get("health")
    @HealthCheck()
    async healthChecks(): Promise<HealthCheckResult> {
        return await this.health.check([
            () =>
                this.redisIndicator.checkHealth("redis", {
                    type: "redis",
                    client: this.redis,
                    timeout: 500,
                }),
        ]);
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
