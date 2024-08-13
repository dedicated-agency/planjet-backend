import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TaskService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly notification: NotificationService,
    ){}

    async create(
        data: {
            project_id: number,
            name: string,
            description: string,
            deadline: string,
            participant: number[],
            priority: number
        }, user_id: string
    )
    {
        const {
            project_id,
            name,
            description,
            deadline,
            participant,
            priority
        } = data;

        const project = await this.prisma.project.findUnique({
            where: {
                id: Number(project_id),
            }
        });
        if(!project) throw new NotFoundException("Project not found");
        const check = await this.prisma.task.findFirst({
            where: {
                project_id: Number(project.id),
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
            });

            const newTask = await this.prisma.task.create({
                data: {
                    status_id: Number(status.id),
                    project_id: Number(project.id),
                    user_id: String(user_id),
                    name,
                    participants: `${user_id}`,
                    description,
                    deadline: new Date(deadline),
                    priority
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

            await this.prisma.taskChange.create({
                data: {
                    user_id: String(user_id),
                    task_id: Number(newTask.id),
                    type: "created",
                    old_value: "created",
                    new_value: "created"
                }
            });

            await this.notification.send(newTask.project.group_id, 13, newTask.user.language_code, "createTask", newTask);

            await this.prisma.taskUser.createMany({
                data: participant.map((part: any) => ({
                    user_id: String(part),
                    task_id: newTask.id
                }))
            });

            return newTask;
        }

        return check
    }

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
                    old_value: task.status.name,
                    new_value: status.name
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

    async updatePriority(user_id: number, priority_id: number, id: number)
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

            if(Number(priority_id) !== task.priority)
            {
                await this.prisma.task.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        priority: Number(priority_id)
                    }
                });
            }

            const change = await this.prisma.taskChange.create({
                data: {
                    user_id: String(user_id),
                    task_id: Number(id),
                    type: "priority",
                    old_value: String(task.priority),
                    new_value: String(priority_id)
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
                    project: true,
                    taskUser: {
                        include: {
                            user: true
                        }
                    },
                    taskChange: {
                        include: {
                            user: true,
                        }
                    },
                    taskComment: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            if(!task) throw new NotFoundException("Task not found");

            return task;
        } catch (error) {
            console.log("Show task show id " + error);
        }
    }

    async participants(usernames: string[], task_id: number)
    {
        if(usernames.length > 0)
        {
            usernames.map(async (username) => {
                try {
                    const user = await this.prisma.user.findFirst({
                        where: {
                            username: username.replace(/^@/, '')
                        }
                    });
                    if(!user) return
                    const task = await this.prisma.task.findUnique({
                        where: {
                            id: Number(task_id)
                        }
                    });
                    if(!task) return

                    const check = await this.prisma.taskUser.findFirst({
                        where: {
                            user_id: user.telegram_id,
                            task_id: Number(task_id)
                        }
                    });

                    if(!check)
                    {
                        await this.prisma.taskUser.create({
                            data: {
                                user_id: user.telegram_id,
                                task_id: Number(task_id)
                            }
                        });
                    }

                } catch (error) {
                    console.log("taskUser error" + error);
                }
            });
        }
    }

}


