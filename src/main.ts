import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthGuard } from './auth/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors:true});
  app.useGlobalGuards(new AuthGuard());

  await app.listen(process.env.APP_PORT);
  app.enableCors();
  console.log("Project is running... PORT: " + process.env.APP_PORT)
}
bootstrap();
