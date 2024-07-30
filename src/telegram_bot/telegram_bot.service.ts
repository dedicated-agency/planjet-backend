import { Injectable } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import axios from 'axios';

@Injectable()
export class TelegramBotService {
    private bot: Telegraf<Context>;

    private token = process.env.TELEGRAM_BOT_TOKEN

    constructor(
    ) {
        this.bot = new Telegraf(this.token);
        this.bot.start((ctx) => this.handleStart(ctx));
        this.bot.on('text', (ctx) => this.handleText(ctx));
        // this.bot.command('getGroupInfo', this.getGroupInfo.bind(this));
        this.bot.on('message', (ctx) => {
            const chat = ctx.chat;
            if (chat.type === 'group' || chat.type === 'supergroup') {
               
                

                console.log(`Group name: ${chat.title}`);
                console.log(`Group ID: ${chat.id}`);
            }
        });
    
        this.bot.launch();
    }


    private async handleStart(ctx) {
        ctx.reply('Welcome to task manager');
      }

    
    private async handleText(ctx) {
        
        const chat = ctx.chat;

        console.log(ctx.message);
        // id: -1002124515037,
        // id: -1002124515037,
        
        if(ctx.message.text === 'come_on_manager')
        {
            // console.log({
            //     ctx,
            //     options: ctx.telegram.options,
            //     update: ctx.update,
            //     chat: ctx.update.message.chat,
            //     from:  ctx.update.message.from,
            //     reply_to_message:  ctx.update.message.reply_to_message,
            // });
            const chat = await ctx.telegram.getChat(ctx.chat.id);
            console.log(chat);
        }
        ctx.reply('Welcome to task manager');
    }





}
