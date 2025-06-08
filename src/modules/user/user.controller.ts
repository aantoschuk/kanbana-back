import { Get, Controller, Param, UseGuards } from "@nestjs/common";

import { UserService } from "./user.service";

import { AuthGuard } from "../auth/auth.guard";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("string")
    getString(): string {
        return this.userService.getString();
    }

    @Get()
    get() {
        return this.userService.get();
    }

    @UseGuards(AuthGuard)
    @Get(":email")
    async getOne(@Param() params: { email: string }) {
        const user = await this.userService.findOne(params.email);

        const { password, ...cleanUser } = user;
        return cleanUser;
    }
}
