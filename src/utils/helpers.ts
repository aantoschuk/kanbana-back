import { eq, and, gt,  desc } from "drizzle-orm";

import { TClient } from "../types/types";

import {
    rolesTable,
    userRolesTable,
    refreshTokenTable,
} from "../db/schemas/schema";

// snippet to retrieve user roles form db
export const getUserRole = (db: TClient, userId: number) => {
    return db
        .select({
            id: rolesTable.id,
            name: rolesTable.name,
        })
        .from(rolesTable)
        .innerJoin(userRolesTable, eq(userRolesTable.roleId, rolesTable.id))
        .where(eq(userRolesTable.userId, userId));
};

// retirieve refresh token by db and sorted by creation date
export const getRefreshTokensFromDB = async (db: TClient, email: string) => {
    const tokens = await db
        .select()
        .from(refreshTokenTable)
        .where(
            and(
                eq(refreshTokenTable.userEmail, email),
                eq(refreshTokenTable.revoked, false),
                gt(refreshTokenTable.expires_at, new Date()),
            ),
        ).orderBy(desc(refreshTokenTable.created_at));

    return tokens;
};
