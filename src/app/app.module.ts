import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";

import {AppService} from "./app.service";
import {AppController} from "./app.controller";
import configuration from "../config/configuration";

@Module({
    imports: [ConfigModule.forRoot({load: [configuration]})],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
