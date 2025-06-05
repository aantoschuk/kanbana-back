import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { Injectable, OnModuleInit } from "@nestjs/common";

import configuration from "src/config/configuration";

import { TClient } from "../../types/types";

@Injectable()
export class DbService implements OnModuleInit {
    private db: TClient;

    async onModuleInit() {
        const config = configuration().database;
        const pool = new Pool({
            connectionString: config.url,
            ssl: config.ssl,
        });
        await pool.connect();
        this.db = drizzle(pool);
        console.log("Connected to the database");
    }

    getDB() {
        if (!this.db) throw new Error("DB is not initialized");
        return this.db;
    }
}
