import { eq } from "drizzle-orm";
import { Injectable, NotFoundException } from "@nestjs/common";

// modules & functions
import { DbService } from "../database/db.service";
import { hashPassword, getUserRole } from "../../utils";

// types
import { CreateUserDTO } from "./dto/user.dto";
import {
    rolesTable,
    usersTable,
    userRolesTable,
} from "../../db/schemas/schema";

@Injectable()
export class UserService {
    constructor(private readonly dbService: DbService) {}

    getString(): string {
        return "User";
    }

    async createUser(
        user: CreateUserDTO,
    ): Promise<{ id: number; role: string; email: string }> {
        // hash pass
        const hash: string = await hashPassword(user.password);

        // create new user object
        const newUser: typeof usersTable.$inferInsert = {
            name: user.name,
            email: user.email,
            password: hash,
        };

        // get db and insert into table
        const db = this.dbService.getDB();
        // count users

        // get user id
        const registered = await db
            .insert(usersTable)
            .values(newUser)
            .returning({ id: usersTable.id });

        // get user role
        const roles = await db
            .select()
            .from(rolesTable)
            .where(eq(rolesTable.name, "user"))
            .limit(1);

        const role = roles[0];

        if (!role) {
            throw new Error(`Role "user" not found in roles table`);
        }

        await db.insert(userRolesTable).values({
            userId: registered[0].id,
            roleId: role.id,
        });

        return {
            id: registered[0].id,
            role: role.name,
            email: user.email,
        };
    }

    async get() {
        const db = this.dbService.getDB();
        const users = db.select().from(usersTable);
        return users;
    }

    async findOne(email: string) {
        const db = this.dbService.getDB();
        email = email.trim().toLowerCase();

        const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (users.length === 0) {
            throw new NotFoundException();
        }

        const user = users[0];

        const roles = await getUserRole(db, user.id);

        return { ...user, roles };
    }
}
