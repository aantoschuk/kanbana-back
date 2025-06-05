import { eq } from "drizzle-orm";
import { Injectable } from "@nestjs/common";

// modules & functions
import { hashPassword } from "src/utils/auth";
import { DbService } from "../database/db.service";

// types
import { CreateUserDTO } from "./dto/user.dto";
import { usersTable } from "src/db/schemas/schema";

@Injectable()
export class UserService {
    constructor(private readonly dbService: DbService) {}

    getString(): string {
        return "User";
    }

    async createUser(user: CreateUserDTO): Promise<CreateUserDTO> {
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
        await db.insert(usersTable).values(newUser);

        return newUser;
    }

    async get() {
        const db = this.dbService.getDB();
        const users = db.select().from(usersTable);
        return users;
    }

    async findOne(email: string)  {
        const db = this.dbService.getDB();
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))

        return user[0]
    }
}
