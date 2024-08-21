import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
            name,
            group_id
        } = props;

        let project = await this.prisma.project.findFirst({
            where: {
                topic_id: String(topic_id),
                name: topic_title,
                group_id: String(group_id)
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
            });

            let description = "";
            let title = name;
            if(name.length > 190)
            {
                description = name;
                title = name.substring(0, 50) + "..."
            }

            const data: any = {
                status_id: Number(status.id),
                project_id: Number(project.id),
                message_id: Number(message_id),
                user_id: String(user_id),
                name: title,
                description,
                participants: `${user_id}`
            }

            return await this.prisma.task.create({
                data: data
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
        let status_ID = status_id;
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

            let status: any = "";
            console.log({status_ID, task});
            if(status_ID === -1)
            {
                const checkStatus = await this.prisma.status.findFirst({
                    where: {
                        name: "Completed",
                        project_id: Number(task.project_id)
                    }
                })
                console.log({status_ID, task, checkStatus});
            }else{
                status = await this.prisma.status.findUnique({
                    where: {
                        id: Number(status_ID)
                    }
                });
            }
        
            if(!status) throw new NotFoundException("Status not available");
            const data: any = {
                status_id: Number(status_ID)
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
            console.log(error);
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

    async delete(user_id: number, id: number)
    {
        try {
            const task = await this.prisma.task.findUnique({
                where: {
                    id: Number(id)
                }
            });
    
            if(!task) throw new NotFoundException("Task not found");
    
            try {
                const taskComments = await this.prisma.taskComment.deleteMany({
                    where: {
                        task_id: Number(task.id)
                    }
                });
            } catch (error) {
                console.log("Delete taskComments error: " + error);
            }

            try {
                const taskChanges = await this.prisma.taskChange.deleteMany({
                    where: {
                        task_id: Number(task.id)
                    }
                });
            } catch (error) {
                console.log("Delete taskComments error: " + error);
            }

            try {
                const taskUsers = await this.prisma.taskUser.deleteMany({
                    where: {
                        task_id: Number(task.id)
                    }
                });
            } catch (error) {
                console.log("Delete taskComments error: " + error);
            }
       
            const check = await this.prisma.task.delete({
                where: {
                    id: Number(task.id)
                }
            });

            if(check)
            {
                return "Deleted successfully"
            }else{
                return "Not deleted"
            }
       
        } catch (error) {
            console.log("Delete task error: " + error);
            return "Not deleted"
        }
    }

    async archive(user_id: number, id: number, archive: boolean)
    {
        try {
            const task = await this.prisma.task.findUnique({
                where: {
                    id: Number(id)
                }
            });
            if(!task) throw new NotFoundException("Task not found");
            if(archive)
            {
                await this.prisma.task.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        is_archive: true
                    }
                });
            }else{
                await this.prisma.task.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        is_archive: false
                    }
                });
            }
            return "Successfully changed";
        } catch (error) {
            console.log("Archive error: " + error);
        }
    }

    async comment(user_id: number, id: number, text: string)
    {
        try {
            const task = await this.prisma.task.findUnique({
                where: {
                    id: Number(id)
                }
            });
            if(!task) throw new NotFoundException("Task not found");

            if(text === "") throw new BadRequestException("Not found text");

            const comment = this.prisma.taskComment.create({
                data: {
                    comment: text,
                    task_id: Number(id),
                    user_id: String(user_id)
                }
            });

            if(comment)
            {
                return comment
            }

            throw new NotFoundException("Task not found"); 
        } catch (error) {
            console.log("create commment error: " + error);
            throw new NotFoundException("Task not found"); 
        }
    }

    async participant(id: number, participant: number[], telegram_id: number)
    {
        const task = await this.prisma.task.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                taskUser: true
            }
        });

        if(!task) throw new NotFoundException("Task not found");

        try {
            if(participant.length > 0)
            {
                const task_participant = task.taskUser.map(taskUser => taskUser.user_id);

                participant.map(async (participant_element) => {
                    const check = await this.prisma.taskUser.findFirst({
                        where: {
                            user_id: String(participant_element),
                            task_id: Number(id)
                        }
                    });

                    
                })
            }
        } catch (error) {
            console.log("Update participant error: " + error);
        }
    }
}


