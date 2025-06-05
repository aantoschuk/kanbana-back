import { Injectable } from "@nestjs/common";

import { verifyPassword } from "src/utils/auth";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async signIn(email: string, password: string) {
        const user = await this.userService.findOne(email);

        if (!user) {
            return "Cannot find that user";
        }

        const verified = verifyPassword(user.password, password);
        if (!verified) {
            return "Wrong Credentials";
        }

        return user
    }
}

// TODO: add JWT 
