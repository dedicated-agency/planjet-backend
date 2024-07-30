import { Controller, Get, Param } from '@nestjs/common';
import { TelegramBotService } from './telegram_bot.service';

@Controller('telegram-bot')
export class TelegramBotController {
  constructor(private readonly telegramBotService: TelegramBotService) {}

  @Get(':chatId')
  async botTopics(
    @Param("chatId") chat_id: number
  )
  {
    console.log(chat_id);
    
    // return await this.telegramBotService.getForumTopics(chat_id);
  }
}
