import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { publicEncrypt, privateDecrypt } from 'crypto';

const publicKey = process.env.PUBLIC_KEY?.replace(/\\n/g, "\n");
const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");


@Injectable()
export class UserService {

    constructor(
        private readonly prisma: PrismaService
    ){}

    async init(data: {
        id: number,
        first_name: string,
        username:string,
        language_code:string,
    } ){
        const {id, first_name, username, language_code} = data;
        const check = await this.prisma.user.findUnique({
            where: {
                telegram_id: String(id)
            },
            include: {
                tasks: true,
                groupUsers: {
                    include: {
                        group: true
                    }
                }
            }
        });

        if (!check) 
        {
            return await this.prisma.user.create({
                data: {
                    telegram_id: String(id),
                    name: first_name,
                    username,
                    language_code: language_code ? language_code : "en",
                }
            });  
        }

        return check
    }

    async tasks(user_id: string, status: string, project_id?: number)
    {
        if(status === undefined) status = 'To do';
        
        const mainQuery: any = {
            taskUser: {
                some: {
                    user_id
                }
            },
            status: {
                name: status
            }
        };
        
        if(project_id !== undefined && !isNaN(project_id)) mainQuery.project_id = Number(project_id);
        
        const tasks = await this.prisma.task.findMany({
            where: mainQuery,
            include: {
                status: true,
                project: true,
            }
        });
       
        return tasks;
    }

    async tasksHeader(user_id: string, project_id?: number)
    {
        const mainQuery: any = {
            taskUser: {
                some: {
                    user_id
                }
            }
        }
        if(project_id) mainQuery.project_id = Number(project_id);
        const tasks = await this.prisma.task.findMany({
            where: mainQuery,
            include: {
                status: true,
            }
        });

        const todo = [];
        const process = [];
        const test = [];
        const completed = [];

        if(tasks.length)
        {
            tasks.map((task) => {
                if(task.status.name === 'To do')
                {
                    todo.push(task);
                }
                else if(task.status.name === 'In Progress')
                {
                    process.push(task);
                }
                else if(task.status.name === 'Testing')
                {
                    test.push(task);
                }
                else if(task.status.name === 'Completed')
                {
                    completed.push(task);
                }
            });
        }

        return [
            {
                id: 1,
                name: 'To do',
                count: todo.length
            },
            {
                id: 2,
                name: 'In Progress',
                count: process.length
            },
            {
                id: 3,
                name: 'Testing',
                count: test.length
            },
            {
                id: 4,
                name: 'Completed',
                count: completed.length
            }
        ]
    }

    async events(user_id: string, isViewed: string)
    {
        let is_viewed = false
        if(isViewed === '1')
        {
            is_viewed = true
        }
        const tasks = await this.prisma.task.findMany({
            where: {
                taskUser: {
                    some: {
                        user_id
                    }
                },
                taskChange: {
                    some: {
                        notification: {
                            some: {
                                user_id,
                                is_viewed
                            }
                        }
                    }
                }
            },
            include: {
                project: {
                    include: {
                        group: true
                    }
                },
                taskChange: {
                    include: {
                        user: true,
                        notification: true
                    }
                }
            }
        });

        if (!tasks.length) return [];

        const events: any[] = [];

        tasks.map((task) => {
            const element = {
                task_id: task.id,
                task_name: task.name,
                project: task.project.name,
                group: task.project.group.name,
                events: []
            }

            if(task.taskChange.length)
            {
                const changes = {};
                task.taskChange.map((change) => {
                    const { user_id, user } = change;

                    if (!changes[user_id]) {
                        changes[user_id] = {
                          user_id,
                          user_name: user.name,
                          changes: []
                        };
                    }
                    changes[user_id].changes.push({
                        type: change.type,
                        old_value: change.old_value,
                        new_value: change.new_value,
                        created_at: change.created_at,
                    });
                });
                element.events = Object.values(changes);
            }
            events.push(element);
        });

        return events;
    }

    async groups(user_id: string) 
    {
        const data = await this.prisma.group.findMany({
            where: {
                groupUsers: {
                    some: {
                        user_id
                    }
                }
            },
            include: {
                projects: {
                    include: {
                        tasks: true
                    }
                },
                groupUsers: true,
            }
        });

        if(!data.length) return []

        const result = [];

        data.map((element) => {
            let is_selected = false;

            if(element.groupUsers.length)
            {
                element.groupUsers.map((groupUser) => {
                    if(groupUser.user_id === user_id && groupUser.is_selected) is_selected = true;
                });
            }

            result.push({
                id: element.id,
                name: element.name,
                is_selected,
                projects: element.projects
            })
        });

        return result;
    }


    async language(id: string, lang: string)
    {
        
        try {
            const result = await this.prisma.user.update({
                where: {
                    telegram_id: id,
                },
                data: {
                    language_code: lang
                }
            });
            if(result) return {"message": "Successfully changed"}
            throw new BadRequestException("Language not updated ")
        } catch (error) {
            console.log(error);
            throw new BadRequestException("Language not updated ")
        }
    }
}
