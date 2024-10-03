import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StatusService {
    private defaultStatuses = {
        uz: {
            todo: "Qilish kerak",
            progress: "Bajarilmoqda",
            test: "Sinov",
            completed: "Tugallangan",
            cancelled: "Bekor qilingan"
        },
        en: {
            todo: "To do",
            progress: "In Progress",
            test: "Testing",
            completed: "Completed",
            cancelled: "Cancelled"
        },
        ru: {
            todo: "К выполнению",
            progress: "В процессе",
            test: "На проверке",
            completed: "Завершено",
            cancelled: "Отменено"
        }
    }
    constructor(
        private readonly prisma: PrismaService
    ){}

    async init(data: {
        project_id: number,
        name: string,
        lang: string
    }){
        const {project_id, name, lang} = data;
        const check = await this.prisma.status.findFirst({
            where: {
                project_id: Number(project_id),
                name,
            }
        });
        if(!check){
            const count = (await this.prisma.status.findMany({
                where: {
                    project_id: Number(project_id)
                }
            })).length;
            await this.prisma.status.create({
                data: {
                    project_id: Number(project_id),
                    name,
                    order: Number(count + 1)
                } 
            }) 
        }
        return true;
    }

    async defaultMaker(project_id: number, lang: string)
    {
        if(!lang)
        {
            lang = 'en'
        }
        const data = this.defaultStatuses[lang];
        try {
            await this.prisma.status.createMany({
                data: [
                    {
                        project_id: Number(project_id),
                        name: data.todo,
                        order: 1
                    },
                    {
                        project_id: Number(project_id),
                        name: data.progress,
                        order: 2
                    },
                    {
                        project_id: Number(project_id),
                        name: data.test,
                        order: 3
                    },
                    {
                        project_id: Number(project_id),
                        name: data.completed,
                        order: 4
                    },
                    {
                        project_id: Number(project_id),
                        name: data.cancelled,
                        order: 5
                    }
                ]
            })
        } catch (error) {
            console.log("Default status create error: " + error);
        }
    }

    async getStatuses(id: number, user_ids?: string[])
    {
        try {
            console.log({id});
            
            const results: any = [];
            const check = await this.prisma.project.findUnique({
                where: {
                    id: Number(id)
                }
            });

            if(!check) throw new NotFoundException("Project not found")
            const statuses = await this.prisma.status.findMany({
                where: {
                    project_id: Number(id),
                }
            });
            const queryCode: any = {
                project_id: Number(id),
                is_archive: false,
            }

            if(user_ids.length)
            {
                queryCode.taskUser = {
                    some: {
                        user_id: {
                            in: user_ids
                        }
                    }
                }
            }

            const tasks = await this.prisma.task.findMany({
                where: queryCode
            });

            statuses.map(status => {
                const element: any = {
                    id: status.id,
                    name: status.name,
                    project_id: status.project_id,
                    order: status.order,
                    tasksCount: 0
                }
                tasks.forEach(task => {
                    if (task.status_id === status.id) {
                        element.tasksCount += 1;
                    }
                });
                results.push(element)
            })
            return results;
        } catch (error) {
            console.log("Get Status error: " + error);
        }
    }

    async deleteStatus(id: number)
    {
        const check = await this.prisma.status.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                tasks: {
                    include: {
                        taskChange: true,
                        taskComment: true,
                        taskUser: true
                    }
                }
            }
        });

        if(!check) throw new NotFoundException("Status not found");

        if (check.tasks.length > 0) {
            for (const task of check.tasks) {
                try {
                    await this.prisma.taskComment.deleteMany({
                        where: { task_id: Number(task.id) }
                    });
        
                    await this.prisma.taskChange.deleteMany({
                        where: { task_id: Number(task.id) }
                    });
        
                    await this.prisma.taskUser.deleteMany({
                        where: { task_id: Number(task.id) }
                    });
        
                    await this.prisma.task.delete({
                        where: { id: Number(task.id) }
                    });
                } catch (error) {
                    console.log("Project task delete error: " + error);
                }
            }
        }
        
        await this.prisma.status.delete({
            where: {
                id: Number(check.id)
            }
        })

        return "Successfully deleted"
    }
}
