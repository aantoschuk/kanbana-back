import {
    Get,
    Body,
    Post,
    UsePipes,
    Controller,
    ValidationPipe,
} from "@nestjs/common";

import { UserService } from "./user.service";
import { CreateUserDTO } from "./dto/user.dto";

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

    // NOTE: only for test dev purpose, should be in auth
    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() createUserDTO: CreateUserDTO) {
        const user = await this.userService.createUser(createUserDTO);
        return user;
    }
}
