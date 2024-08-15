import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class GroupService {

    constructor(
        private readonly prisma: PrismaService
    ){}

    async init(data: {
        id: number,
        name: string
    } ){
        const {id, name} = data;
        const check = await this.prisma.group.findUnique({
            where: {
                id: String(id)
            }
        });

        if (!check) 
        {
            return await this.prisma.group.create({
                data: {
                    id: String(id),
                    name: name,
                }
            });  
        }

        return check
    }

    async checkUsers(userIds: number[], group_id: number)
    {
        if(userIds.length)
        {
            userIds.map(async (userId: number) => {
                const check = await this.prisma.groupUser.findFirst({
                    where: {
                        user_id: String(userId),
                        group_id: String(group_id)
                    }
                });
                if(!check)
                {
                    await this.prisma.groupUser.create({
                        data: {
                            user_id: String(userId),
                            group_id: String(group_id)
                        }
                    });

                    const mytaskproject = await this.prisma.project.create({
                        data: {
                            name: "mytasks",
                            topic_id: String(userId),
                        }
                    });

                    if(mytaskproject)
                    {
                        let statuses: any = await this.prisma.status.findMany({
                            where: {
                                project_id: Number(mytaskproject.id)
                            }
                        });
            
                        if(statuses.length === 0)
                        {
                            statuses = await this.prisma.status.createMany({
                                data: this.statusList.map((element) => ({
                                    name: element.name,
                                    order: element.id,
                                    project_id: Number(mytaskproject.id) 
                                }))
                            });
                        }
                    }
                }
            });
        }
        return true;
    }

    async main(user_id: number)
    {
        try {
            const groups = await this.prisma.group.findMany({
                where: {
                    groupUsers: {
                        some: {
                            user_id: String(user_id)
                        }
                    }
                },
                include: {
                    projects: true
                }
            });
            
            return groups;
        } catch (error) {
            console.log("Error group main " + error);
        }
    }

    async showById(user_id: number, id: number)
    {
        try {
            return await this.prisma.group.findUnique({
                where: {
                    id: String(id)
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
        } catch (error) {
            console.log("Group show by id" + error);
        }
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
}
