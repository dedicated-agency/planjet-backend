import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram_bot.service';
import { TelegramBotController } from './telegram_bot.controller';

@Module({
  controllers: [TelegramBotController],
  providers: [TelegramBotService],
})
export class TelegramBotModule {}
