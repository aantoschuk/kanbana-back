import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { verifyPassword } from "../../utils";

import { UserService } from "../user/user.service";
import { CreateUserDTO } from "../user/dto/user.dto";
import { TRefreshTokenProps } from "../../types/types";
import { RefreshTokenService } from "./refresToken.service";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private refreshTokenService: RefreshTokenService,
    ) {}

    // sing up function
    async signUp(userDto: CreateUserDTO, refreshTokenData: TRefreshTokenProps) {
        // create a new user
        const user = await this.userService.createUser(userDto);

        // create a jwt token
        const payload = { email: user.email, role: user.role, id: user.id };
        const token = await this.jwtService.signAsync(payload);

        // create a refresh token
        const { rawToken: refreshToken } =
            await this.refreshTokenService.create({
                userEmail: user.email,
                userAgent: refreshTokenData.userAgent,
                ipAddress: refreshTokenData.ipAddress,
            });

        return { user, token, refreshToken };
    }

    // sign in function
    async signIn(
        email: string,
        password: string,
        refreshTokenData: TRefreshTokenProps,
    ) {
        const user = await this.userService.findOne(email);

        // if there is no user in database, then user is not registered
        if (!user) {
            throw new NotFoundException("User is not registered");
        }

        const verified = verifyPassword(user.password, password);
        if (!verified) {
            throw new UnauthorizedException("Wrong Credentials");
        }

        const payload = { email: user.email, roles: user.roles };
        // create jtw token
        const token = await this.jwtService.signAsync(payload);

        // create refresh token
        const { rawToken: refreshToken } =
            await this.refreshTokenService.create({
                userEmail: payload.email,
                userAgent: refreshTokenData.userAgent,
                ipAddress: refreshTokenData.ipAddress,
            });
        return { token, refreshToken };
    }
}
