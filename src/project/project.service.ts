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
                group_id: Number(groupId),
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
                    topic_id: Number(id),
                    group_id: Number(groupId),
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
                    id: Number(group_id)
                }
            });

            if(!group) throw new NotFoundException("Group");

            return await this.prisma.project.findMany({
                where: {
                    group_id: Number(group_id),
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

    async showById(project_id: number, status?:number)
    {
        if(!status)
        {
            const statusId = await this.prisma.status.findFirst({
                where: {
                    project_id: Number(project_id),
                    order: 1
                }
            });
            status = statusId.id
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
                where: {
                    project_id: Number(project_id),
                    status_id: Number(status)
                },
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
}
