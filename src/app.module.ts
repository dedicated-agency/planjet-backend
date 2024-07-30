import { Module } from '@nestjs/common';
import { TelegramBotModule } from './telegram_bot/telegram_bot.module';
import { TelegramBotService } from './telegram_bot/telegram_bot.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TelegramBotModule
  ],
  controllers: [],
  providers: [TelegramBotService],
})
export class AppModule {}
