import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";

// config import
import configuration from "./config/configuration";

// AppModule files
import { AppController } from "./modules/app/app.controller";
import { AppService } from "./modules/app/app.service";
import { UserModule } from "./modules/user/user.module";

@Module({
    imports: [ConfigModule.forRoot({load: [configuration]}), UserModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
