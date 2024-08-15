import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { languages } from 'src/local/static';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NotificationService {
    constructor(
        private readonly prisma: PrismaService
    ){}
    async send(chat_id: string, change_id: number, lang: string, type?: string, task?: any)
    {
        const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        try {
            console.log(
                chat_id, change_id, lang, type, task
            );
            
            if(task && type === "createTask")
            {
                // console.log({
                //     chat_id: "-100" + chat_id,
                //     text: this.createTask(lang, task),
                //     parse_mode: 'html',
                //     message_thread_id: task.project.topic_id,
                // });


                const data: any = {
                    chat_id: "-100" + chat_id,
                    text: this.createTask(lang, task),
                    parse_mode: 'html',
                }

                if(task.project.topic_id !== '1')
                {
                    data.message_thread_id = task.project.topic_id
                }
    
                
                const result = await axios.post(url, data);
                return "success"
            }else{
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
                if (!change) {
                    console.log('change not found in messageShaper')
                    return 
                }
    
                // console.log({
                //     change,
                //     chat_id: chat_id,
                //     text: this.messageShaper(lang, change),
                //     message_thread_id: change.task.project.topic_id,
                //     parse_mode: 'HTML',
                // })

                const data: any = {
                    chat_id: "-100" + chat_id,
                    text: this.messageShaper(lang, change),
                    parse_mode: 'html',
                }

                if(change.task.project.topic_id !== '1')
                {
                    data.message_thread_id = change.task.project.topic_id
                }
    
                const result = await axios.post(url, data);
                return "success"
            }
           
        } catch (error) {
            console.log('send error' +  error.response ? error.response.data : error.message);
        }
    }

    messageShaper(lang: string = 'en', change: any)
    {
        // (status, priority, name, deadline)
        try {
            return `#${languages[lang].change} by ${change.user.name}

<a href='https://t.me/dedicated_task_manager_bot/Task_Manager?startapp=tasks_${change.task_id}'>${change.task.name}</a>

${languages[lang].project}: <b>${change.task.project.name} 💻</b>

${languages[lang].author}: <b>${change.task.user.username ? "<a href='https://t.me/" + change.task.user.username + "'>" + change.task.user.name + "</a>" : change.task.user.name }</b>
   
${languages[lang][change.type]}: <b>${change.old_value} ➡️ ${change.new_value}</b> 
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
}
