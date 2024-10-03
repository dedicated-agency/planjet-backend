import { Injectable, NotFoundException } from '@nestjs/common';
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
            const result = await this.prisma.user.create({
                data: {
                    telegram_id: String(id),
                    name: first_name,
                    username,
                    language_code: language_code ? language_code : "en",
                }
            });  
            return {...result, token: this.encrypt(result.telegram_id)}
        }

        return {...check, token: this.encrypt(check.telegram_id)}
    }

    async tasks(user_id: string, status: string)
    {
        if(status === undefined) status = 'To do';
        const tasks = await this.prisma.task.findMany({
            where: {
                taskUser: {
                    some: {
                        user_id
                    }
                },
                status: {
                    name: status
                }
            },
            include: {
                status: true,
                project: true,
            }
        });
       
        return tasks;
    }

    async tasksHeader(user_id: string)
    {
        const tasks = await this.prisma.task.findMany({
            where: {
                taskUser: {
                    some: {
                        user_id
                    }
                }
            },
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

    async events(user_id: string, is_viewed: string)
    {
        const checkUser = await this.prisma.user.findUnique({
            where: {
                telegram_id: user_id
            }
        });

        if(!checkUser) return [];

        let mainQuery: any = {
            user_id,
            is_viewed: false,
            change: { isNot: null },
        }

        if(is_viewed === '1')
        {
            mainQuery.is_viewed = true
        }

        const events = await this.prisma.notification.findMany({
            // where: mainQuery,
            where: {
                user_id,
                is_viewed: false,
                change: { 
                    id: { not: null }
                 }
            },
            include: {
                change: {
                    include: {
                        task: {
                            include: {
                                project: true
                            }
                        }
                    }
                }
            }
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

    encrypt(data: string): string {
        const encryptedData = publicEncrypt(publicKey, Buffer.from(data));
        return encryptedData.toString('base64');
    }
    
    decrypt(encryptedData: string): string {
        const decryptedData = privateDecrypt(privateKey, Buffer.from(encryptedData, 'base64'));
        return decryptedData.toString();
    }
}
