import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getBotToken } from 'nestjs-telegraf';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const bot = app.get(getBotToken());
  app.use(bot.webhookCallback("/"));
  await app.listen(process.env.APP_PORT);
  console.log("Project is running... PORT: " + process.env.APP_PORT)
}
bootstrap();
