import { Test, TestingModule } from "@nestjs/testing";
import { HealthCheckService } from "@nestjs/terminus";
import { RedisHealthIndicator } from "@liaoliaots/nestjs-redis-health";

import { AppService } from "./app.service";
import { AppController } from "./app.controller";

const RedisConnectionToken = 'default_IORedisModuleConnectionToken';

describe("AppController", () => {
    let appController: AppController;

        beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                AppService,
                {
                    provide: HealthCheckService,
                    useValue: { check: jest.fn() },
                },
                {
                    provide: RedisHealthIndicator,
                    useValue: { checkHealth: jest.fn() },
                },
                {
                    provide: RedisConnectionToken,
                    useValue: {}, 
                },
            ],
        }).compile();

        appController = module.get<AppController>(AppController);
    });

    describe("root", () => {
        it('should return "Hello World!"', () => {
            expect(appController.getHello()).toBe("Hello World!");
        });
    });
});
