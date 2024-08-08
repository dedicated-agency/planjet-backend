import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { languages } from 'src/local/static';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NotificationService {
    constructor(
        private readonly prisma: PrismaService
    ){}
    async send(chat_id: string, change_id: number, lang: string)
    {
        const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        try {
            const change = await this.prisma.taskChange.findUnique({
                where: {
                    id: Number(change_id)
                },
                include: {
                    task: {
                        include: {
                            project: true,
                            user: true
                        }
                    },
                    user: true,
                }
            });
            if (!change) {
                console.log('change not found in messageShaper')
                return 
            }
            const result = await axios.post(url, {
                chat_id: chat_id,
                text: await this.messageShaper(lang, change),
                message_thread_id: change.task.project.topic_id,
                parse_mode: 'HTML',
            });
            console.log({result});
            return "success"
        } catch (error) {
            console.log('send error' + error);
        }
    }

    async messageShaper(lang: string = 'en', change: any)
    {
        // (status, priority, name, deadline)
        try {
           
            return `#${languages[lang].change} by ${change.user.name}
<a href="https://t.me/dedicated_task_manager_bot/tasks/${change.task_id}">olma</a>
${languages[lang].project}: <b>${change.task.project.name} 💻</b>
${languages[lang].author}: <b>${change.task.user.name}</b> 
   
${languages[lang][change.type]}: <b>${change.old_value} ➡️ ${change.task[change.type]}</b> 
`
        } catch (error) {
            console.log("Error messageShaper: " + error);
        }
    }
}
