import { Injectable } from "@nestjs/common";

import { DbService } from "../database/db.service";
import { rolesTable } from "src/db/schemas/schema";

@Injectable()
export class RoleService {
    constructor(private readonly dbService: DbService) {}

    get() {
        const db = this.dbService.getDB();
        const roles = db.select().from(rolesTable);
        return roles;
    }
}
