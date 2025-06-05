import { Module } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { DBModule } from "../database/db.module";
import { UserService } from "../user/user.service";
import { AuthController } from "./auth.controller";

@Module({
    imports: [DBModule],
    providers: [AuthService, UserService ],
    controllers: [AuthController],
})

export class AuthModule {}
