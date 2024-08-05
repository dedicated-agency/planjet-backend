import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors:true});
  await app.listen(process.env.APP_PORT);
    // Enable CORS
    app.enableCors();
  console.log("Project is running... PORT: " + process.env.APP_PORT)
}
bootstrap();
