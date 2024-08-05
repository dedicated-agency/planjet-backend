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
                id: Number(id)
            }
        });

        if (!check) 
        {
            return await this.prisma.group.create({
                data: {
                    id: Number(id),
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
                        user_id: Number(userId),
                        group_id: Number(group_id)
                    }
                });
                if(!check)
                {
                    await this.prisma.groupUser.create({
                        data: {
                            user_id: Number(userId),
                            group_id: Number(group_id)
                        }
                    });
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
                            user_id: Number(user_id)
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
                    id: Number(id)
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
}
