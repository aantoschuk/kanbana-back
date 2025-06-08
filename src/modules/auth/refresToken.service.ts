import { eq } from "drizzle-orm";
import { Injectable } from "@nestjs/common";

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
    constructor(private readonly dbService: DbService) {}

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
        await db.insert(refreshTokenTable).values(token);

        // limit user token to 5 per user
        await this.revokeOldTokens(createDto.userEmail, 4);

        return { rawToken };
    }

    // validate
    async validate(email: string, rawToken: string) {
        const db = this.dbService.getDB();

        const tokens = await getRefreshTokensFromDB(db, email);

        for (const token of tokens) {
            const isValid = await verifyRefreshToken(token.hash, rawToken);
            if (isValid) {
                return token;
            }
        }

        return null;
    }

    // revoke token
    async revoke(id: number) {
        try {
            const db = this.dbService.getDB();
            await db
                .update(refreshTokenTable)
                .set({ revoked: true })
                .where(eq(refreshTokenTable.id, id));

            return true;
        } catch {
            return false;
        }
    }

    async deleteRevokedTokens () {
        const db = this.dbService.getDB()

        await db.delete(refreshTokenTable).where(eq(refreshTokenTable.revoked, true))
    }

    private async revokeOldTokens(email: string, keepLatest = 4) {
        const db = this.dbService.getDB();

        const tokens = await getRefreshTokensFromDB(db, email);

        const tokensToRevoke = tokens.slice(keepLatest);

        for (const token of tokensToRevoke) {
            await this.revoke(token.id);
        }
    }
}
