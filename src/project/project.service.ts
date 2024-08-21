import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProjectService {

    constructor(
        private readonly prisma: PrismaService
    ){}

    async init(props: {
        id: number,
        groupId: number,
        name: string
    }){
        const {groupId, name, id } = props;
        const check = await this.prisma.project.findFirst({
            where: {
                group_id: String(groupId),
                name,
            },
            include: {
                statuses: true,
                tasks: {
                    include: {
                        user: true
                    }
                }
               
            }
        });

        if (!check) 
        {
            return await this.prisma.project.create({
                data: {
                    topic_id: String(id),
                    group_id: String(groupId),
                    name,
                }
            });  
        }

        return check
    }

    async main(group_id: number)
    {
        try {
            const group = await this.prisma.group.findUnique({
                where: {
                    id: String(group_id)
                }
            });

            if(!group) throw new NotFoundException("Group");

            return await this.prisma.project.findMany({
                where: {
                    group_id: String(group_id),
                },
                include: {
                    tasks: {
                        include: {
                            user: true,
                            status: true
                        }
                    },
                    statuses: true,
                }
            });
        } catch (error) {
            console.log("Error Project main: " + error);
        }
    }

    async showById(props: {project_id: number, status?:number, user_id?: number})
    {
        const  {project_id} = props;
        let {status, user_id} = props;
        if(!status)
        {
            const statusId = await this.prisma.status.findFirst({
                where: {
                    project_id: Number(project_id),
                    order: 1
                }
            });
            if(statusId)
            {
                status = statusId.id
            }else{
                status = 0
            } 
        }

        const queryCode: any = {
            project_id: Number(project_id),
            status_id: Number(status),
            is_archive: false
        }

        if(user_id)
        {
            const user = await this.prisma.user.findUnique({
                where: {
                    telegram_id: String(user_id)
                }
            });
            if(!user) throw new NotFoundException("User not found");
            queryCode.taskUser = {
                some: {
                    user_id: String(user_id)
                }
            }
        }
  
        try {
            const project: any = await this.prisma.project.findUnique({
                where: {
                    id: Number(project_id)
                },
                include: {
                    statuses: true
                }
            });

            const tasks = await this.prisma.task.findMany({
                where: queryCode,
                include: {
                    user: true,
                    status: true
                }
            });

            const users = await this.prisma.user.findMany({
                where: {
                    groupUsers: {
                        some: {
                            group: {
                                projects: {
                                    some: {
                                        id: Number(project_id)
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if(!project)  return [];
            project.users = users;
            project.tasks = tasks ? tasks : [];

            return project;
        } catch (error) {
            console.log("Project show by id: " + error);
        }
    }

    async deleteFunc(id: number)
    {
            const check = await this.prisma.project.findUnique({
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
                    },
                    statuses: true
                }
            });
            if(!check) throw new NotFoundException("Project not found");


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
            
            if (check.statuses.length > 0) {
                try {
                    await this.prisma.status.deleteMany({
                        where: {
                            id: {
                                in: check.statuses.map((status) => Number(status.id)),
                            },
                        },
                    });
                } catch (error) {
                    console.log("Project status delete error: " + error);
                }
            }

            await this.prisma.project.delete({
                where: {
                    id: Number(check.id)
                }
            })

        return "Successfully deleted"
    }

    async notification(id: number, type: string, value: boolean)
    {
        const project = await this.prisma.project.findUnique({
            where: {
                id: Number(id)
            }
        });

        if(!project) throw new NotFoundException("Project not found");

        const data: any = {};

        if(type === 'create')
        {
            data.add_permission = value
        }else if(type === 'status')
        {
            data.status_permission = value
        }else if(type === 'comment')
        {
            data.comment_permission = value
        }

        try {
            return await this.prisma.project.update({
                where: {
                    id: Number(id)
                },
                data
            })
        } catch (error) {
            console.log("Edit permission error " + error);
        }
    }
}
