import { Module } from "@nestjs/common";

import { UserService } from "./user.service";
import { DBModule } from "../database/db.module";
import { UserController } from "./user.controller";

@Module({
    imports: [DBModule],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
