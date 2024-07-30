import { Module } from '@nestjs/common';
import { TelegramBotModule } from './telegram_bot/telegram_bot.module';
import { TelegramBotService } from './telegram_bot/telegram_bot.service';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: process.env.TELEGRAM_BOT_TOKEN,
        launchOptions: {
          webhook: {
            polling: true,
            domain: process.env.TELEGRAM_BOT_TOKEN,
            path: '/telegram_circle',
          }
        }
      }),
    }),
    TelegramBotModule
  ],
  controllers: [],
  providers: [TelegramBotService],
})
export class AppModule {}
