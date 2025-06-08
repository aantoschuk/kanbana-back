import {
    Req,
    Res,
    Post,
    Body,
    UsePipes,
    HttpCode,
    UseGuards,
    Controller,
    HttpStatus,
    ValidationPipe,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";

import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { RefreshTokenService } from "./refresToken.service";

import { SignInDTO } from "./dto/auth.dto";
import { RequestWithUser } from "../../types/types";
import { CreateUserDTO } from "../user/dto/user.dto";

@Controller("auth")
export class AuthController {
    constructor(
        private jwtService: JwtService,
        private authService: AuthService,
        private refreshTokenService: RefreshTokenService,
    ) {}

    @Post("login")
    @UsePipes(new ValidationPipe({ transform: true }))
    async signIn(
        @Req() req: Request,
        @Body() signInDto: SignInDTO,
        @Res({ passthrough: true }) res: Response,
    ) {
        // authenticate user and create tokens
        const { token, refreshToken } = await this.authService.signIn(
            signInDto.email,
            signInDto.password,
            { userAgent: req.headers["user-agent"], ipAddress: req.ip },
        );

        this.setCookie(res, refreshToken);

        return { message: "Logged in", token };
    }

    @Post("signup")
    @UsePipes(new ValidationPipe({ transform: true }))
    async register(
        @Req() req: Request,
        @Body() createUserDto: CreateUserDTO,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { token, refreshToken } = await this.authService.signUp(
            createUserDto,
            { userAgent: req.headers["user-agent"], ipAddress: req.ip },
        );

        this.setCookie(res, refreshToken);

        return { message: "User registered", token };
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post("refresh")
    async refreshToken(
        @Body("refreshToken") rawToken: string,
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        try {
            const email = req?.user?.email;

            if (!email) {
                throw new UnauthorizedException();
            }

            const tokenRecord = await this.refreshTokenService.validate(
                email,
                rawToken,
            );

            if (!tokenRecord) {
                throw new UnauthorizedException(
                    "Invalid or expired refresh token",
                );
            }

            await this.refreshTokenService.revoke(tokenRecord.id);

            const { rawToken: newRefreshToken } =
                await this.refreshTokenService.create({
                    userEmail: email,
                    userAgent: req.headers["user-agent"],
                    ipAddress: req.ip,
                });

            const newAccessToken = this.jwtService.sign({ email });

            this.setCookie(res, newRefreshToken);

            return {
                token: newAccessToken,
            };
        } catch {
            throw new UnauthorizedException();
        }
    }

    @UseGuards(AuthGuard)
    @Post("logout")
    async logout(
        @Req() req: RequestWithUser,
        @Body("refreshToken") refreshToken: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const email = req.user?.email;
        if (!email || !refreshToken) {
            throw new UnauthorizedException();
        }

        const tokenRecord = await this.refreshTokenService.validate(
            email,
            refreshToken,
        );

        if (tokenRecord) {
            await this.refreshTokenService.revoke(tokenRecord.id);
        }

        res.clearCookie("refreshToken", {
            path: "/auth/refresh",
        });

        return { message: "Logged out" };
    }

    private setCookie(res: Response, refreshToken: string) {
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // set true in prod, false in dev
            sameSite: "lax",
            path: "/auth/refresh", // cookie only sent to refresh endpoint
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        });
    }
}
