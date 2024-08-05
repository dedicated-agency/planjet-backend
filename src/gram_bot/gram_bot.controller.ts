import { Controller } from '@nestjs/common';
import { GramBotService } from './gram_bot.service';

@Controller('gram-bot')
export class GramBotController {
  constructor(private readonly gramBotService: GramBotService) {}
}
