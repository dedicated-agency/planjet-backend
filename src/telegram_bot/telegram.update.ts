import { Update, Ctx, Start, Help, On, Hears } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class TelegramUpdate {
  @Start()
  async startCommand(@Ctx() ctx: Context) {
    await ctx.reply('Welcome! How can I help you?');
  }

  @Help()
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async onSticker(@Ctx() ctx: Context) {
    await ctx.reply('👍');
  }

  @Hears('hi')
  async onHi(@Ctx() ctx: Context) {
    await ctx.reply('Hey there');
  }
}
