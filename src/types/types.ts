import { drizzle } from "node_modules/drizzle-orm/node-postgres";

export type TClient = ReturnType<typeof drizzle>
