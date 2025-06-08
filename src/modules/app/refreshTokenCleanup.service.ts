import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { RefreshTokenService } from "../auth/refresToken.service";

@Injectable()
export class RefreshTokenCleanupService {
    constructor(private readonly refreshTokenService: RefreshTokenService) {}

    // remove unused tokens every midnight
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        try {
            await this.refreshTokenService.deleteRevokedTokens();
        } catch (error) {
            console.log("Error cleaning revoked tokens: ", error);
        }
    }
}
