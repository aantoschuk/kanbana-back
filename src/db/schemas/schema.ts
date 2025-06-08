import {
    pgTable,
    integer,
    varchar,
    primaryKey,
    text,
    timestamp,
    boolean,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
});

export const rolesTable = pgTable("roles", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 50 }).notNull(),
});

export const userRolesTable = pgTable(
    "user_roles",
    {
        userId: integer()
            .notNull()
            .references(() => usersTable.id),
        roleId: integer()
            .notNull()
            .references(() => rolesTable.id),
    },
    table => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const refreshTokenTable = pgTable("refresh_token", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar()
        .notNull()
        .references(() => usersTable.email),
    hash: text().notNull(),
    created_at: timestamp().notNull(),
    expires_at: timestamp().notNull(),
    userAgent: text(),
    ipAddress: text(),
    revoked: boolean().default(false),
});
