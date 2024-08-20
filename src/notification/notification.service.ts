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

            if(task && task.project?.topic_id !== '1') { data.message_thread_id = task.project.topic_id }
            
            if(task && type === "createTask" && project.add_permission)
            {
                data.text = this.createTask(lang, task);
            }else if(project.status_permission){
                if (!change) {
                    console.log('change not found in messageShaper')
                    return 
                }
                data.text = this.messageShaper(lang, change);
            }
            await axios.post(this.url, data);
            return "success"
        } catch (error) {
            console.log('send error' +  error);
        }
    }

    messageShaper(lang: string = 'en', change: any)
    {
        try {
            return `#${languages[lang].change} by ${change.user.name}

<a href='https://t.me/dedicated_task_manager_bot/Task_Manager?startapp=tasks_${change.task_id}'>${change.task.name}</a>

${languages[lang].project}: <b>${change.task.project.name} 💻</b>

${languages[lang].author}: <b>${change.task.user.username ? "<a href='https://t.me/" + change.task.user.username + "'>" + change.task.user.name + "</a>" : change.task.user.name }</b>
   
${languages[lang][change.type]}: <b>${change.old_value} ➡️  ${change.new_value}</b> 
`
        } catch (error) {
            console.log("Error messageShaper: " + error);
        }
    }

    createTask(lang: string = 'en', task: any)
    {
        try {
            
            return `#task by ${task.user.name}

<a href='https://t.me/dedicated_task_manager_bot/Task_Manager?startapp=tasks_${task.id}'>${task.name}</a>

${languages[lang].project}: <b>${task.project.name} 💻</b>

${languages[lang].author}: <b>${task.user.username ? "<a href='https://t.me/" + task.user.username + "'>" + task.user.name + "</a>" : task.user.name }</b>
   
<b>${languages[lang].task_created}</b> 
`
        } catch (error) {
            console.log("Error createTask: " + error);
        }
    }

    async addBotToChannel(chat_id: number, lang: string = 'en')
    {
   
        try {
             const text = `${languages[lang].add_bot_to_group}

/manager ${languages[lang].open_app}

/add ${languages[lang].add_task}

/tasks ${languages[lang].tasks}

/done ${languages[lang].task_done}`

            const data: any = {
                chat_id: `-100${chat_id}`,
                text,
                parse_mode: 'html',
            };
            await axios.post(this.url, data);
            return "success";
        } catch (error) {
            console.log("Error add Bot to Channel: " + error);
        }
    }
}
