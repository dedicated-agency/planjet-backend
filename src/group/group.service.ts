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
}
