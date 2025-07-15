import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RefreshTokenService } from "./refresToken.service";

describe("AuthController", () => {
    let authController: AuthController;
    let authService: Partial<AuthService>;
    let jwtService: Partial<JwtService>;
    let refreshTokenService: Partial<RefreshTokenService>;

    beforeEach(async () => {
        authService = {
            signIn: jest.fn(),
            signUp: jest.fn(),
        };

        jwtService = {
            sign: jest.fn(),
        };

        refreshTokenService = {
            validate: jest.fn(),
            revoke: jest.fn(),
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: JwtService, useValue: jwtService },
                { provide: RefreshTokenService, useValue: refreshTokenService },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
    });

    describe("signIn", () => {
        it("should login user and set refresh cookie", async () => {
            const req = {
                headers: { "user-agent": "test-agent" },
                ip: "127.0.0.1",
            } as any;

            const res = {
                cookie: jest.fn(),
            } as any;

            (authService.signIn as jest.Mock).mockResolvedValue({
                token: "jwt-token",
                refreshToken: "refresh-token",
            });

            const body = { email: "test@example.com", password: "password" };

            const result = await authController.signIn(req, body, res);

            expect(authService.signIn).toHaveBeenCalledWith(
                "test@example.com",
                "password",
                { userAgent: "test-agent", ipAddress: "127.0.0.1" },
            );
            expect(res.cookie).toHaveBeenCalledWith(
                "refreshToken",
                "refresh-token",
                expect.objectContaining({ httpOnly: true }),
            );
            expect(result).toEqual({
                message: "Logged in",
                token: "jwt-token",
            });
        });
    });

    describe("register", () => {
        it("should register user and set refresh cookie", async () => {
            const req = {
                headers: { "user-agent": "test-agent" },
                ip: "127.0.0.1",
            } as any;

            const res = {
                cookie: jest.fn(),
            } as any;

            (authService.signUp as jest.Mock).mockResolvedValue({
                token: "jwt-token",
                refreshToken: "refresh-token",
            });

            const createUserDto = {
                name: "Jhon Doe",
                email: "test@example.com",
                password: "password",
            };

            const result = await authController.register(
                req,
                createUserDto,
                res,
            );

            expect(authService.signUp).toHaveBeenCalledWith(createUserDto, {
                userAgent: "test-agent",
                ipAddress: "127.0.0.1",
            });
            expect(res.cookie).toHaveBeenCalledWith(
                "refreshToken",
                "refresh-token",
                expect.objectContaining({ httpOnly: true }),
            );
            expect(result).toEqual({
                message: "User registered",
                token: "jwt-token",
            });
        });
    });

    describe("refreshToken", () => {
        it("should refresh tokens and set new refresh cookie", async () => {
            const req = {
                user: { email: "test@example.com" },
                headers: { "user-agent": "test-agent" },
                ip: "127.0.0.1",
                cookies: { refreshToken: "old-refresh-token" },
            } as any;

            const res = {
                cookie: jest.fn(),
            } as any;

            (refreshTokenService.validate as jest.Mock).mockResolvedValue({
                id: 1,
            });
            (refreshTokenService.revoke as jest.Mock).mockResolvedValue(
                undefined,
            );
            (refreshTokenService.create as jest.Mock).mockResolvedValue({
                rawToken: "new-refresh-token",
            });
            (jwtService.sign as jest.Mock).mockReturnValue("new-jwt-token");

            const result = await authController.refreshToken(req, res);

            expect(refreshTokenService.validate).toHaveBeenCalledWith(
                "test@example.com",
                "old-refresh-token",
            );
            expect(refreshTokenService.revoke).toHaveBeenCalledWith(1);
            expect(refreshTokenService.create).toHaveBeenCalledWith({
                userEmail: "test@example.com",
                userAgent: "test-agent",
                ipAddress: "127.0.0.1",
            });
            expect(jwtService.sign).toHaveBeenCalledWith({
                email: "test@example.com",
            });
            expect(res.cookie).toHaveBeenCalledWith(
                "refreshToken",
                "new-refresh-token",
                expect.objectContaining({ httpOnly: true }),
            );
            expect(result).toEqual({ token: "new-jwt-token" });
        });

        it("should throw UnauthorizedException if no email in user", async () => {
            const req = {
                user: {},
                headers: {},
                ip: "127.0.0.1",
                cookies: { refreshToken: "old-refresh-token" },
            } as any;

            await expect(
                authController.refreshToken(req, {} as any),
            ).rejects.toThrow(UnauthorizedException);
        });

        it("should throw UnauthorizedException if token invalid", async () => {
            const req = {
                user: { email: "test@example.com" },
                headers: {},
                ip: "127.0.0.1",
            } as any;

            (refreshTokenService.validate as jest.Mock).mockResolvedValue(null);

            await expect(
                authController.refreshToken(req, {} as any),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe("logout", () => {
        it("should revoke refresh token and clear cookie", async () => {
            const req = {
                user: { email: "test@example.com" },
                cookies: {
                    refreshToken: "refresh-token",
                },
            } as any;

            const res = {
                clearCookie: jest.fn(),
            } as any;

            (refreshTokenService.validate as jest.Mock).mockResolvedValue({
                id: 1,
            });
            (refreshTokenService.revoke as jest.Mock).mockResolvedValue(
                undefined,
            );

            const result = await authController.logout(req, res);

            expect(refreshTokenService.validate).toHaveBeenCalledWith(
                "test@example.com",
                "refresh-token",
            );
            expect(refreshTokenService.revoke).toHaveBeenCalledWith(1);
            expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", {
                path: "/auth/refresh",
            });
            expect(result).toEqual({ message: "Logged out" });
        });

        it("should throw UnauthorizedException if email or token missing", async () => {
            await expect(
                authController.logout(
                    { user: {}, cookies: {} } as any,
                    {} as any,
                ),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
