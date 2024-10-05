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
            // const change = await this.prisma.taskChange.findUnique({
            //     where: {
            //         id: Number(change_id)
            //     },
            //     include: {
            //         task: {
            //             include: {
            //                 project: true,
            //                 user: true,
            //                 status: true,
            //             }
            //         },
            //         user: true,
            //     }
            // });

            // const project = change.task.project;
            // const projectPermissions = JSON.parse(project.projectNotificationPermissions);
            // const statusPermissions = JSON.parse(project.statusNotificationPermissions);

            // const data: any = {
            //     chat_id: `-100${chat_id}`,
            //     text: '',
            //     parse_mode: 'html',
            // };

            // if(task && task.project?.topic_id !== '1') 
            // { 
            //     data.message_thread_id = task.project.topic_id 
            // }
            // else if(change && change.task.project.topic_id !== '1')
            // {
            //     data.message_thread_id = change.task.project.topic_id
            // }

            // if(task && type === "createTask" && projectPermissions.includes('create'))
            // {
            //     const makedMsg = this.createTask(lang, task)
            //     data.text = makedMsg.text;
            //     data.reply_markup = makedMsg.inlineKeyboard
            // }else if(change){
            //     if(change.type === "status"){
            //         if(statusPermissions.includes("todo") && change.new_value === "To do")
            //         {
            //             const makedMsg = this.messageShaper(lang, change)
            //             data.text = makedMsg.text;
            //             data.reply_markup = makedMsg.inlineKeyboard
            //         }else if(statusPermissions.includes("in_progress") && change.new_value === "In Progress")
            //         {
            //             const makedMsg = this.messageShaper(lang, change)
            //             data.text = makedMsg.text;
            //             data.reply_markup = makedMsg.inlineKeyboard
            //         }else if(statusPermissions.includes("testing") && change.new_value === "Testing")
            //         {
            //             const makedMsg = this.messageShaper(lang, change)
            //             data.text = makedMsg.text;
            //             data.reply_markup = makedMsg.inlineKeyboard
            //         }else if(statusPermissions.includes("completed") && change.new_value === "Completed")
            //         {
            //             const makedMsg = this.messageShaper(lang, change)
            //             data.text = makedMsg.text;
            //             data.reply_markup = makedMsg.inlineKeyboard
            //         }

            //     }else if(projectPermissions.includes('comment') && change.type === "comment")
            //     {
            //         const makedMsg = this.createComment(lang, change)
            //         data.text = makedMsg.text;
            //         data.reply_markup = makedMsg.inlineKeyboard
            //     }
            // } 

            // if(data.text)
            // {
            //     await axios.post(this.url, data);
            // }
            // console.log(data);
            
            // return "success"

            const change = await this.prisma.taskChange.findUnique({
                where: { id: Number(change_id) },
                include: {
                    task: {
                        include: { project: true, user: true, status: true },
                    },
                    user: true,
                },
            });
    
            const { task: changeTask } = change;
            const { project } = changeTask;
            const projectPermissions = JSON.parse(project.projectNotificationPermissions);
            const statusPermissions = JSON.parse(project.statusNotificationPermissions);
    
            const data: any = {
                chat_id: `-100${chat_id}`,
                text: '',
                parse_mode: 'html',
            };

            let makedMsg: any = {
                text: "",
                inlineKeyboard: {}
            };
    
            const topic_id = task?.project?.topic_id !== '1'
                ? task.project.topic_id
                : changeTask.project.topic_id !== '1'
                ? changeTask.project.topic_id
                : null;
    
            if (topic_id) data.message_thread_id = topic_id;
    
            if (type === "createTask" && projectPermissions.includes('create') && task) {
                makedMsg = this.createTask(lang, task);
            } else if (change) {
                if (change.type === "status" && statusPermissions.includes(change.new_value.replace(/ /g, '_').toLowerCase())) {
                    makedMsg = this.messageShaper(lang, change);
                } else if (change.type === "comment" && projectPermissions.includes('comment')) {
                    makedMsg = this.createComment(lang, change);
                } 
            }
    
            data.text = makedMsg.text;
            data.reply_markup = makedMsg.inlineKeyboard;
            if (data.text) await axios.post(this.url, data);
    
            console.log(data);
            return "success";
        } catch (error) {
            console.log('send error' +  error);
            console.log(error.message);
        }
    }

    messageShaper(lang: string = 'en', change: any)
    {
        try {
            if(change.type === 'status') return {
                text: `# ${languages[lang][change.type]}: <b>${change.old_value} ➡️  ${change.new_value}</b> | ${change.user.name}

<b>${change.task.name.length > 50 ? change.task.name.substring(0, 50) + "..." : change.task.name}</b>`,
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
                text: `${languages[lang].task_created} 

<b>${task.name.length > 50 ? task.name.substring(0, 50) + "..." : task.name}</b>
<b>${task.description}</b>

${languages[lang].author}: <b>${task.user.name}</b>`,
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
                text: `${languages[lang].comment_was_written} | ${change.user.name}

<b>${change.task.name.length > 50 ? change.task.name.substring(0, 50) + "..." : change.task.name}</b>

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
            reply_markup: this.inlineKeyboard(String(process.env.TELEGRAM_WEB_APP_URL), 'en', 'commands')
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
            }else{
                data.message_thread_id = topic.id 
            }
            if(project)
                {
                data.reply_markup = this.inlineKeyboard(String(process.env.TELEGRAM_WEB_APP_URL) + `?startapp=projects_${project.id}`, 'en', 'commands')
            }
        }

        try {
             const text = `${topic ? languages[lang].manager_commands : languages[lang].add_bot_to_group}

/dashboard ${languages[lang].dashboard}
/commands ${languages[lang].open_app}
/add ${languages[lang].add_task}
/done ${languages[lang].task_done}`;

// /tasks ${languages[lang].tasks}
            
            data.text = text
            await axios.post(this.url, data);
            return "success";
        } catch (error) {
            console.log("Error add Bot to Channel: " + error);
            console.log(error);
        }
    }

    inlineKeyboard(url: string, lang: string = 'en', type: string = 'not')
    {
        const buttons = [
            [{
                text: type === 'commands' ? languages[lang].dashboard : languages[lang].open_task,
                url: type === 'commands' ? String(process.env.TELEGRAM_WEB_APP_URL) : url
            }]
        ];
    
        if (type === 'commands') {
            buttons.push([{
                text: languages[lang].open_app,
                url: url
            }]);
        }
    
        return {
            inline_keyboard: buttons
        };
    }
}
