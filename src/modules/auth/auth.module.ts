import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

// modules
import { DBModule } from "../database/db.module";

// controllers
import { AuthController } from "./auth.controller";

// services
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { RefreshTokenService } from "./refresToken.service";

import configuration from "../../config/configuration";

@Module({
    imports: [
        DBModule,
        JwtModule.registerAsync({
            global: true,
            useFactory: async () => {
                const config = configuration();
                return {
                    secret: config.secret,
                    signOptions: { expiresIn: "15m" },
                };
            },
        }),
    ],
    providers: [AuthService, UserService, RefreshTokenService],
    controllers: [AuthController],
})
export class AuthModule {}

