import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TaskService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly notification: NotificationService
    ){}

    async init(props: any)
    {
        const { 
            topic_id,
            topic_title, 
            message_id, 
            user_id, 
            name 
        } = props;

        const project = await this.prisma.project.findFirst({
            where: {
                topic_id: String(topic_id),
                name: topic_title
            }
        });
        if(!project) throw new NotFoundException("Project not found");
        const check = await this.prisma.task.findFirst({
            where: {
                project_id: Number(project.id),
                message_id: Number(message_id),
                user_id: String(user_id),
                name,
            },
            include: {
                status: true,
                user: true,
                project: {
                    include: {
                        group: true
                    }
                }
               
            }
        });

        if (!check) 
        {
            let statuses: any = await this.prisma.status.findMany({
                where: {
                    project_id: Number(project.id)
                }
            });

            if(statuses.length === 0)
            {
                statuses = await this.prisma.status.createMany({
                    data: this.statusList.map((element) => ({
                        name: element.name,
                        order: element.id,
                        project_id: Number(project.id) 
                    }))
                });
            }

            const status = await this.prisma.status.findFirst({
                where: {
                    project_id: Number(project.id)
                },
                orderBy: {
                    order: "asc"
                }
            })
            return await this.prisma.task.create({
                data: {
                    status_id: Number(status.id),
                    project_id: Number(project.id),
                    message_id: Number(message_id),
                    user_id: String(user_id),
                    name,
                    participants: `${user_id}`
                }
            });  
        }

        return check
    }


    private statusList = [
        {
            id: 1,
            name: "To do",
        },
        {
            id: 2,
            name: "In Progress",
        },
        {
            id: 3,
            name: "Testing",
        },
        {
            id: 4,
            name: "Completed",
        }
    ];


    async tasks(user_id: number, status_id: number, id: number)
    {
        try {
            return await this.prisma.task.findMany({
                where: {
                    project_id: Number(id),
                    status_id: Number(status_id)
                },
                include: {
                    user: true,
                    status: true,
                    project: true
                }
            });
        } catch (error) {
            console.log("Tasks error :" + error);
        }
    }

    async updateStatus(user_id: number, status_id: number, id: number)
    {
        try {
            const task = await this.prisma.task.findUnique({
                where: {
                    id: Number(id)
                },
                include: {
                    status: true,
                    project: true,
                }
            });
            if(!task) throw new NotFoundException("Task not found");
            const status = await this.prisma.status.findUnique({
                where: {
                    id: Number(status_id)
                }
            });
            if(!status) throw new NotFoundException("Status not available");
            const data: any = {
                status_id: Number(status_id)
            }
            if(status.name === "Завершено" || status.name === "Tugallangan" || status.name === "Completed"){
                data.is_completed = true;
            }else if(task.is_completed){
                data.is_completed = false;
            }
            await this.prisma.task.update({
                where: {
                    id: Number(id)
                },
                data
            });

            const change = await this.prisma.taskChange.create({
                data: {
                    user_id: String(user_id),
                    task_id: Number(id),
                    type: "status",
                    old_value: task.status.name
                }
            });

            if(change) this.notification.send(task.project.group_id, change.id, 'en')

            return {
                message: "Status successfully changed"
            }

        } catch (error) {
            console.log("Update status task: " + error);
        }
    }

    async show(id: number)
    {
        try {
            const task = await this.prisma.task.findUnique({
                where: {
                    id: Number(id)
                },
                include: {
                    status: true,
                    user: true,
                    project: true
                }
            });

            if(!task) throw new NotFoundException("Task not found");

            return task;
        } catch (error) {
            console.log("Show task show id " + error);
        }
    }

}


