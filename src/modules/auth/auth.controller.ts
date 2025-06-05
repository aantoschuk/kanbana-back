import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from "@nestjs/common";

import { AuthService } from "./auth.service";

import { SignInDTO } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post("login")
    @UsePipes(new ValidationPipe({ transform: true }))
    signIn(@Body() signInDto: SignInDTO) {
        return this.authService.signIn(signInDto.email, signInDto.password);
    }
}
