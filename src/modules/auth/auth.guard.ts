import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";

import configuration from "../../config/configuration";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctxType = context.getType();

        let token: string | undefined;

        if (ctxType === "http") {
            const request = context.switchToHttp().getRequest<Request>();
            token = this.extractTokenFromHeader(request);
        } else if (ctxType === "ws") {
            const client = context.switchToWs().getClient();
            // const data = context.switchToWs().getData();

            // for ws, tokens are often sent in handshake query params:
            const handshake = client.handshake;
            token = handshake?.headers?.authorization
                ? this.extractTokenFromString(handshake.headers.authorization)
                : handshake?.query?.token; // fallback if token sent as query param
        } else {
            // handle other context types
        }

        if (!token) {
            throw new UnauthorizedException("No token found");
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: configuration().secret,
            });

            if (ctxType === "http") {
                const request = context.switchToHttp().getRequest();
                request["user"] = payload;
            } else if (ctxType === "ws") {
                const client = context.switchToWs().getClient();
                client.user = payload; // attach user payload on client object
            }
        } catch {
            throw new UnauthorizedException("Invalid token");
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const auth = request.headers.authorization;
        return this.extractTokenFromString(auth);
    }

    private extractTokenFromString(authHeader?: string): string | undefined {
        const [type, token] = authHeader?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
