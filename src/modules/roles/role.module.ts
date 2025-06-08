import { Module } from "@nestjs/common";

import { DBModule } from "../database/db.module";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";

@Module({
    imports: [DBModule],
    controllers: [RoleController],
    providers: [RoleService],
})
export class RoleModule {}
