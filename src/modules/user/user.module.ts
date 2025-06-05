import { Module } from "@nestjs/common";

import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DbService } from "../database/db.service";

@Module({
    imports: [],
    controllers: [UserController],
    providers: [UserService, DbService],
})
export class UserModule {}
