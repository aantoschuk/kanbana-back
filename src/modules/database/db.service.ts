import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Injectable, OnModuleInit } from "@nestjs/common";

import configuration from "../../config/configuration";

import { TClient } from "../../types/types";
import { rolesTable } from "../../db/schemas/schema";

@Injectable()
export class DbService implements OnModuleInit {
    private db: TClient;

    async seedRoles(db: TClient) {
        const roles = ["admin", "user", "guest"];
        for (const roleName of roles) {
            const existing = await db
                .select()
                .from(rolesTable)
                .where(eq(rolesTable.name, roleName));

            if (existing.length === 0) {
                await db.insert(rolesTable).values({ name: roleName });
            }
        }
    }

    async onModuleInit() {
        const config = configuration().database;
        const pool = new Pool({
            connectionString: config.url,
            ssl: config.ssl,
        });
        await pool.connect();
        this.db = drizzle(pool);
        console.log("Connected to the database");
        await this.seedRoles(this.db);
    }

    getDB() {
        if (!this.db) throw new Error("DB is not initialized");
        return this.db;
    }
}
