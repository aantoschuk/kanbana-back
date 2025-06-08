import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

// config import
import configuration from "./config/configuration";

// AppModule files
import { AppService } from "./modules/app/app.service";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AppController } from "./modules/app/app.controller";
import { DBModule } from "./modules/database/db.module";
import { RoleModule } from "./modules/roles/role.module";

@Module({
    imports: [
        ConfigModule.forRoot({ load: [configuration] }),
        DBModule,
        UserModule,
        AuthModule,
        RoleModule,
        ScheduleModule.forRoot(),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
