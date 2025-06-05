import {NestFactory} from "@nestjs/core";

import {AppModule} from "./app/app.module";
import configuration from "./config/configuration";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = configuration().port
    await app.listen(port);
}

bootstrap();
