import Redis from "ioredis";
import { eq } from "drizzle-orm";
import { Injectable } from "@nestjs/common";
import { InjectRedis } from "@nestjs-modules/ioredis";

import { DbService } from "../database/db.service";
import {
    verifyRefreshToken,
    generateRefreshToken,
    getRefreshTokensFromDB,
} from "../../utils";

import { CreateRefreshTokenDto } from "./dto/auth.dto";
import { refreshTokenTable } from "../../db/schemas/schema";

@Injectable()
export class RefreshTokenService {
    constructor(
        private readonly dbService: DbService,
        @InjectRedis() private readonly redis: Redis,
    ) {}

    // create refresh token
    async create(
        createDto: Omit<
            CreateRefreshTokenDto,
            "createdAt" | "expiresAt" | "hash"
        >,
    ) {
        // generata a refresh token, hashed and raw
        const { hash, rawToken } = await generateRefreshToken();

        // created_at & expires_at
        const now = new Date();
        const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

        // create refresh token object and store it in database
        const token = {
            ...createDto,
            created_at: now,
            expires_at: expires,
            hash,
        };

        const db = this.dbService.getDB();
        // store to postgres and redis
        await db.insert(refreshTokenTable).values(token);

        this.storeTokenInRedis(rawToken, createDto.userEmail);

        // limit user token to 5 per user
        await this.revokeOldTokens(createDto.userEmail, 4);

        return { rawToken };
    }

    // validate
    async validate(email: string, rawToken: string) {
        const cached = await this.redis.get(`refresh:${rawToken}`);

        // get cached token from the redis and return if data is found
        if (cached) {
            const data = JSON.parse(cached);
            if (data.email === email) return data;
        }

        const db = this.dbService.getDB();

        const tokens = await getRefreshTokensFromDB(db, email);

        for (const token of tokens) {
            const isValid = await verifyRefreshToken(token.hash, rawToken);
            if (isValid) {
                this.storeTokenInRedis(rawToken, email);
                return token;
            }
        }

        return null;
    }

    // revoke token
    async revoke(id: number) {
        try {
            const db = this.dbService.getDB();

            const token = await db
                .select()
                .from(refreshTokenTable)
                .where(eq(refreshTokenTable.id, id))
                .limit(1)
                .then(rows => rows[0]);

            if (!token) {
                return false;
            }

            // update token
            await db
                .update(refreshTokenTable)
                .set({ revoked: true })
                .where(eq(refreshTokenTable.id, id));

            // delete from the redis
            await this.redis.del(`refresh:${token.hash}`);

            return true;
        } catch {
            return false;
        }
    }

    async deleteRevokedTokens() {
        const db = this.dbService.getDB();

        await db
            .delete(refreshTokenTable)
            .where(eq(refreshTokenTable.revoked, true));
    }

    private async revokeOldTokens(email: string, keepLatest = 4) {
        const db = this.dbService.getDB();

        const tokens = await getRefreshTokensFromDB(db, email);

        const tokensToRevoke = tokens.slice(keepLatest);

        for (const token of tokensToRevoke) {
            await this.revoke(token.id);
        }
    }

    // just helper to store token in redis, do not want to type it everytime
    private async storeTokenInRedis(rawToken: string, email: string) {
        await this.redis.set(
            `refresh:${rawToken}`,
            JSON.stringify({ email }),
            "EX",
            7 * 24 * 60 * 60,
        );
    }
}
