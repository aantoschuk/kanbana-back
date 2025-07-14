import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TerminusModule } from "@nestjs/terminus";
import { RoleModule } from "./modules/roles/role.module";
import { RedisModule } from "@nestjs-modules/ioredis";

// config import
import configuration from "./config/configuration";

// AppModule files
import { AppService } from "./modules/app/app.service";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AppController } from "./modules/app/app.controller";
import { DBModule } from "./modules/database/db.module";
import { RedisHealthModule } from "@liaoliaots/nestjs-redis-health";

@Module({
    imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        DBModule,
        UserModule,
        AuthModule,
        RoleModule,
        ScheduleModule.forRoot(),
        RedisModule.forRoot({
            type: "single",
            url: "redis://localhost:6379",
        }),
        TerminusModule,
        RedisHealthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
