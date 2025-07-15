import { Module } from "@nestjs/common";

import { DBModule } from "../database/db.module";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { RateLimitModule } from "../rate-limit/rate-limit.module";

@Module({
    imports: [DBModule, RateLimitModule],
    controllers: [RoleController],
    providers: [RoleService],
})
export class RoleModule {}
