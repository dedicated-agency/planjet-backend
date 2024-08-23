import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { languages } from 'src/local/static';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NotificationService {
    private url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    constructor(
        private readonly prisma: PrismaService
    ){}
    async send(chat_id: string, change_id: number, lang: string, type?: string, task?: any)
    {
        try {
            const change = await this.prisma.taskChange.findUnique({
                where: {
                    id: Number(change_id)
                },
                include: {
                    task: {
                        include: {
                            project: true,
                            user: true,
                            status: true,
                        }
                    },
                    user: true,
                }
            });

            const project = change.task.project;

            const data: any = {
                chat_id: `-100${chat_id}`,
                text: '',
                parse_mode: 'html',
            };

            if(task && task.project?.topic_id !== '1') 
            { 
                data.message_thread_id = task.project.topic_id 
            }
            else if(change && change.task.project.topic_id !== '1')
            {
                data.message_thread_id = change.task.project.topic_id
            }

            if(task && type === "createTask" && project.add_permission)
            {
                const makedMsg = this.createTask(lang, task)
                data.text = makedMsg.text;
                data.reply_markup = makedMsg.inlineKeyboard
            }else if(change){
                if(project.status_permission && change.type === "status"){
                    const makedMsg = this.messageShaper(lang, change)
                    data.text = makedMsg.text;
                    data.reply_markup = makedMsg.inlineKeyboard
                }else if(project.comment_permission && change.type === "comment")
                {
                    const makedMsg = this.createComment(lang, change)
                    data.text = makedMsg.text;
                    data.reply_markup = makedMsg.inlineKeyboard
                }
            } 

            if(data.text)
            {
                await axios.post(this.url, data);
            }
            console.log(data);
            
            return "success"
        } catch (error) {
            console.log('send error' +  error);
            console.log(error.message);
        }
    }

    messageShaper(lang: string = 'en', change: any)
    {
        try {
            return {
                text: `#${languages[lang].change} by ${change.user.name}

<b>${change.task.name}</b>

${languages[lang].project}: <b>${change.task.project.name} 💻</b>

${languages[lang].author}: <b>${change.task.user.name}</b>
   
${languages[lang][change.type]}: <b>${change.old_value} ➡️  ${change.new_value}</b> 
`,
    inlineKeyboard: this.inlineKeyboard(String(process.env.TELEGRAM_WEB_APP_URL) + `?startapp=tasks_${change.task_id}`)
}
        } catch (error) {
            console.log("Error messageShaper: " + error);
        }
    }

    createTask(lang: string = 'en', task: any)
    {
        try {
            return {
                text: `#task by ${task.user.name}

<b>${task.name}</b>

${languages[lang].project}: <b>${task.project.name} 💻</b>

${languages[lang].author}: <b>${task.user.name}</b>
   
<b>${languages[lang].task_created}</b> 
`,
    inlineKeyboard: this.inlineKeyboard(String(process.env.TELEGRAM_WEB_APP_URL) + `?startapp=tasks_${task.id}`)
}
        } catch (error) {
            console.log("Error createTask: " + error);
        }
    }

    createComment(lang: string = 'en', change: any)
    {
        try {
            return {
                text: `#comment by ${change.user.name}

<b>${change.task.name}</b>

${languages[lang].project}: <b>${change.task.project.name} 💻</b>

${languages[lang].author}: <b>${change.task.user.name}</b>
   
${languages[lang].comment}: <b>${change.new_value}</b> 
`,
                inlineKeyboard: this.inlineKeyboard(String(process.env.TELEGRAM_WEB_APP_URL) + `?startapp=tasks_${change.task_id}`)
            }
        } catch (error) {
            console.log("Error messageShaper: " + error);
        }
    }

    async addBotToChannel(chat_id: number, lang: string = 'en', topic?: any)
    {

        const data: any = {
            chat_id: `-100${Number(chat_id)}`,
            text: '',
            parse_mode: 'html',
            reply_markup: this.inlineKeyboard(String(process.env.TELEGRAM_WEB_APP_URL))
        };
        
        if(topic && topic.id) { 
            let project = await this.prisma.project.findFirst({
                where: {
                    group_id: String(chat_id),
                    topic_id: String(topic.id)
                }
            });
            
            if(!project)
            {
                project = await this.prisma.project.findFirst({
                    where: {
                        group_id: String(chat_id),
                        topic_id: '1'
                    }
                });
            }
            if(project)
                {
                data.message_thread_id = topic.id 
                data.reply_markup = this.inlineKeyboard(String(process.env.TELEGRAM_WEB_APP_URL) + `?startapp=projects_${project.id}`)
            }
        }

        try {
             const text = `${topic ? languages[lang].manager_commands : languages[lang].add_bot_to_group}

/manager ${languages[lang].open_app}

/add ${languages[lang].add_task}

/tasks ${languages[lang].tasks}

/done ${languages[lang].task_done}`;
            
            data.text = text
            await axios.post(this.url, data);
            return "success";
        } catch (error) {
            console.log("Error add Bot to Channel: " + error);
            console.log(error);
        }
    }

    inlineKeyboard(url: string, lang: string = 'en')
    {
        return {
            inline_keyboard: [
                [
                    {
                        text: languages[lang].open_app,
                        url: url
                    }
                ]
            ]
        };
    }
}
