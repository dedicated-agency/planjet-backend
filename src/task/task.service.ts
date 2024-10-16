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
            participant: number[],
            priority: number,
            point: number,
            message_id?: number,
        }, user_id: string
    )
    {
        const {
            project_id,
            name,
            description,
            participant,
            priority,
            point,
            message_id,
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
                    priority,
                    point: Number(point),
                    message_id
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

            const change = await this.prisma.taskChange.create({
                data: {
                    user_id: String(user_id),
                    task_id: Number(newTask.id),
                    type: "created",
                    old_value: "created",
                    new_value: "created"
                }
            });

            if(participant.length > 0 && isNaN(Number(participant[0]))) {
                const participants = await this.prisma.user.findMany({
                    where: {
                        username: {
                            in: participant.map(el => String(el))
                        }
                    }
                });
                await this.prisma.taskUser.createMany({
                    data: participants.map((part: any) => ({
                        user_id: part.telegram_id,
                        task_id: newTask.id
                    }))
                });

                for (const participant_user of participants) {
                    await this.createNotification(Number(change.id), String(participant_user.telegram_id))
                }

            }else{
                await Promise.all([
                    this.prisma.taskUser.create({
                        data:{
                            user_id: String(participant[0]),
                            task_id: newTask.id
                        }
                    }),
                    this.createNotification(Number(change.id), String(participant[0]))
                ])
            }

            await this.notification.send(newTask.project.group_id, 13, newTask.user.language_code, "createTask", newTask);
       
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
            group_id,
            participant,
        } = props;


        let title = name;
        let description = "";
        if(name.length > 50)
        {
            description = name;
            title = this.getFirstWords(name, 5)
        }

        let project = await this.prisma.project.findFirst({
            where: {
                topic_id: String(topic_id),
                name: topic_title,
                group_id: String(group_id)
            }
        });

        return await this.create({
            project_id: project.id,
            name: title,
            description,
            participant,
            priority: 2,
            point: 0,
            message_id
        }, user_id)
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
                    status_id: Number(status_id),
                    is_archive: false,
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
        const taskId = Number(id);
        let statusID = Number(status_id);
        try {
            const task = await this.prisma.task.findUnique({
                where: {
                    id: taskId
                },
                include: {
                    status: true,
                    project: true,
                }
            });
            if(!task) throw new NotFoundException("Task not found");

            let status: any;
            if(statusID === -1)
            {
                status = await this.prisma.status.findFirst({
                    where: {
                        name: "Completed",
                        project_id: Number(task.project_id)
                    }
                });
                if (status) statusID = status.id;
            }else{
                status = await this.prisma.status.findUnique({
                    where: { id: statusID },
                });
            }
        
            if(!status) throw new NotFoundException("Status not available");

            const data: any = {
                status_id: statusID,
                is_completed: ["Завершено", "Tugallangan", "Completed"].includes(status.name) || false,
            }

            if (task.is_completed && !data.is_completed) {
                data.is_completed = false;
            }
   
            await this.prisma.task.update({
                where: { id: taskId },
                data
            });

            const change = await this.prisma.taskChange.create({
                data: {
                    user_id: String(user_id),
                    task_id: taskId,
                    type: "status",
                    old_value: task.status.name,
                    new_value: status.name
                }
            });

            if(change){
                await this.notification.send(task.project.group_id, change.id, 'en')

                const taskUsers = await this.prisma.taskUser.findMany({
                    where: {
                        task_id: taskId
                    }
                });

                for (const taskUser of taskUsers) {
                    await this.createNotification(Number(change.id), taskUser.user_id)
                }
            } 

            return {
                message: "Status successfully changed"
            }

        } catch (error) {
            console.log("Update status task: " + error);
            throw error; 
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

            if(change) {
                await this.notification.send(task.project.group_id, change.id, 'en');

                const taskUsers = await this.prisma.taskUser.findMany({
                    where: {
                        task_id: Number(id)
                    }
                });

                for (const taskUser of taskUsers) {
                    await this.createNotification(Number(change.id), taskUser.user_id)
                }
            }

            return {
                message: "Status successfully changed"
            }

        } catch (error) {
            console.log("Update status task: " + error);
        }
    }

    async show(id: number, user_id: string)
    {
        try {
            const task: any = await this.prisma.task.findUnique({
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
                        },
                        orderBy: {
                            id: "desc"
                        }
                    },
                    taskComment: {
                        include: {
                            user: true
                        },
                        orderBy: {
                            id: "desc"
                        }
                    }
                }
            });

            if(!task) throw new NotFoundException("Task not found");

            task.users = await this.prisma.user.findMany({
                where: {
                    groupUsers: {
                        some: {
                            group_id: task.project.group_id
                        }
                    }
                }
            });

            await this.viewed(user_id, task.id)

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
                },
                include: {
                    project: true
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

            const change = await this.prisma.taskChange.create({
                data: {
                    user_id: String(user_id),
                    task_id: Number(id),
                    type: "archive",
                    old_value: "",
                    new_value: "Task was archived"
                }
            });

            if(change){
                await this.notification.send(task.project.group_id, change.id, 'en')

                const taskUsers = await this.prisma.taskUser.findMany({
                    where: {
                        task_id:  Number(id)
                    }
                });

                for (const taskUser of taskUsers) {
                    await this.createNotification(Number(change.id), taskUser.user_id)
                }
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
                },
                include: {
                    status: true,
                    project: true,
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
                const change = await this.prisma.taskChange.create({
                    data: {
                        user_id: String(user_id),
                        task_id: Number(id),
                        type: "comment",
                        old_value: "comment",
                        new_value: text
                    }
                });
    
                if(change) {
                    await this.notification.send(task.project.group_id, change.id, 'en');
                    
                    const taskUsers = await this.prisma.taskUser.findMany({
                        where: {
                            task_id:  Number(id)
                        }
                    });
    
                    for (const taskUser of taskUsers) {
                        await this.createNotification(Number(change.id), taskUser.user_id)
                    }
                }
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
                let old_value = "";
                let new_value = "";
                const oldUsers = await this.prisma.taskUser.findMany({
                    where: {
                        task_id: Number(id),
                    },
                    include: {
                        user: true
                    }
                });
                
                if(oldUsers.length){
                    oldUsers.map(oldUser => {
                        old_value += oldUser.user.name + ", "
                    });
                    await this.prisma.taskUser.deleteMany({
                        where: {
                            task_id: Number(id),
                        }
                    });
                }
          
                const checkCreate = await this.prisma.taskUser.createMany({
                    data: participant.map((participant_item) => ({
                        task_id: Number(id),
                        user_id: String(participant_item)
                    }))
                });

                if(checkCreate)
                {
                    const newUsers = await this.prisma.taskUser.findMany({
                        where: {
                            task_id: Number(id),
                        },
                        include: {
                            user: true
                        }
                    });
                    if(newUsers.length)
                    {
                        newUsers.map(newUser => {
                            new_value += newUser.user.name + ", "
                        });
                    }

                    const change = await this.prisma.taskChange.create({
                        data: {
                            task_id: Number(id),
                            user_id: String(telegram_id),
                            old_value,
                            new_value,
                            type: "participant"
                        }
                    });

                    if(change)
                    {
                        const taskUsers = await this.prisma.taskUser.findMany({
                            where: {
                                task_id:  Number(id)
                            }
                        });
        
                        for (const taskUser of taskUsers) {
                            await this.createNotification(Number(change.id), taskUser.user_id)
                        }
                    }
                }
                
            }

            return "success"
        } catch (error) {
            console.log("Update participant error: " + error);
        }
    }

    async viewed(user_id: string, task_id: number)
    {
        const tasks = await this.prisma.notification.findMany({
            where: {
                user_id,
                change: {
                    task_id: task_id
                }
            }
        });

        const viewedTasks = await this.prisma.notification.updateMany({
            where: {
                user_id,
                change: {
                    task_id: task_id
                }
            },
            data: {
                is_viewed: true
            }
        });

        return;
    }

    async createNotification(change_id: number, user_id: string)
    {
        console.log( change_id,
        user_id,);
        
        await this.prisma.notification.create({
            data: {
                change_id: Number(change_id),
                user_id,
                is_viewed: false,
            }
        });
        return;
    }

    getFirstWords(input: string, wordCount: number) {
        let words = input.split(/\s+/);
        return words.slice(0, wordCount).join(" ");
    }
}


