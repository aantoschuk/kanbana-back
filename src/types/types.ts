import { Request } from "express";
import { drizzle } from "node_modules/drizzle-orm/node-postgres";

export type TClient = ReturnType<typeof drizzle>;

export interface RequestWithUser extends Request {
    user?: {
        email: string;
    };
}

export type TRefreshTokenProps = {
    userAgent?: string;
    ipAddress?: string;
};
