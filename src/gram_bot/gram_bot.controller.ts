import { Controller, Get, Res } from '@nestjs/common';
import { GramBotService } from './gram_bot.service';
import axios from 'axios';
import { Response } from 'express';

@Controller('gram-bot')
export class GramBotController {
  constructor(private readonly gramBotService: GramBotService) {}

  @Get('setCommand')
  async setCommand(
    @Res() res: Response
  )
  {
    const apiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setMyCommands`;

    const commands = [
      { command: 'dashboard', description: 'Приборная панель' },
      { command: 'commands', description: 'Команды' },
      { command: 'add', description: 'Создать задачу' },
      // { command: 'tasks', description: 'Просмотреть задачи проекта' },
      { command: 'done', description: 'Завершить задачу' },
    ];
    return res.json((await axios.post(apiUrl, { commands })).data);

  }
}