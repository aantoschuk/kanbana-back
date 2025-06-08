import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";

// module imports
import { AppModule } from "./app.module";

import configuration from "./config/configuration";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = configuration().port;
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(port);
}

bootstrap();

// add logger and better messaging
