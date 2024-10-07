import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

interface selectGroup {
    is_selected: boolean
    group_id: string
}

@Injectable()
export class GroupService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService
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
                    projects: {
                        include: {
                            tasks: {
                                include: {
                                    status: true
                                }
                            }
                        }
                    },
                    groupUsers: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            if(!groups.length) return [];

            const result: any = [];
            
            groups.map((group) => {
                let allTasks = 0;
                let completedTasks = 0;
                const element: any = {
                    id: group.id,
                    name: group.name,
                    projects: group.projects,
                };

                const users: any = [];
                if(group.groupUsers.length){
                    group.groupUsers.map((groupUser) => {
                        users.push(groupUser.user);
                    });
                }
                element.users = users;

                if(group.projects.length)
                {
                    group.projects.map((project) => {
                        if(project.tasks.length)
                        {
                            project.tasks.map((task) => {
                                allTasks += 1;
                                if(task.status.name === 'Completed')
                                {
                                    completedTasks += 1;
                                }
                            });
                        }
                    })
                }

                element.allTasks = allTasks;
                element.completedTasks = completedTasks;
                result.push(element);
            });
            
            return result;
        } catch (error) {
            console.log("Error group main " + error);
        }
    }

    async showById(user_id: number, id: number)
    {
        try {
            const group: any = await this.prisma.group.findUnique({
                where: {
                    id: String(id)
                },
                include: {
                    projects: {
                        include: {
                            tasks: {
                                include: {
                                    status: true
                                }
                            }
                        }
                    },
                    groupUsers: {
                        include: {
                            user: true
                        }
                    },
                }
            });

            if(group.projects.length)
            {
                const projects: any[] = [];
                group.projects.map((project: any) => {
                    const tasks: any[] = [];
                    if(project.tasks.length > 0)
                    {
                        project.tasks.map((task: any) => {
                            if(task.status?.order === 1)
                            {
                                tasks.push(task)
                            }
                        });
                    }
                    project.tasks = tasks;
                    projects.push(project);
                });
                group.projects = projects;
            }

            return group;
        } catch (error) {
            console.log("Group show by id" + error);
        }
    }

    async selected(id: string, is_selected: string, user_id: string)
    {
        const check = await this.prisma.group.findFirst({
            where: {
                id
            }
        });
        if(!check) throw new BadRequestException("Group not found");
        return await this.prisma.groupUser.update({
            where: { 
                group_id_user_id: {
                    group_id: id,
                    user_id
                }
             },
            data: {
                is_selected: Boolean(is_selected)
            }
        })
    }

    async selectedGroups(user_id: string)
    {
        const data = await this.prisma.group.findMany({
            where: {
                groupUsers: {
                    some: {
                        user_id,
                        is_selected: true
                    }
                }
            },
            include: {
                groupUsers: {
                    include: {
                        user: true
                    }
                },
                projects: {
                    include: {
                        tasks: {
                            where: {
                                status: {
                                    name: "To do"
                                }
                            },
                            include: {
                                status: true
                            }
                        }
                    }
                }
            }
        });

        if(!data.length) return [];
        const result = [];
        
        data.map((element) => {
            const needData = {
                id: element.id,
                name: element.name,
                groupUsers: element.groupUsers,
                tasks: 0
            };

            if(element.projects.length)
            {
                let tasks = 0;
                element.projects.map((project) => {
                    tasks+=project.tasks.length
                });
                needData.tasks = tasks;
            }
            result.push(needData);

        });

        return result;
    }

    async selector (user_id: string, groups: selectGroup[]) 
    {
        if(groups.length)
        {
            for (const element of groups) {
                const check = await this.prisma.group.findFirst({
                    where: {
                        id: String(element.group_id)
                    }
                });
                if(!check) throw new BadRequestException("Group not found");
                await this.prisma.groupUser.update({
                    where: { 
                        group_id_user_id: {
                            group_id: String(element.group_id),
                            user_id
                        }
                     },
                    data: {
                        is_selected: Boolean(element.is_selected)
                    }
                })
            }
        }

        return await this.userService.groups(user_id);
    }

    async users(id: string, user_id?: string)
    {
        try {
            return this.prisma.user.findFirst({
                where: {
                    groupUsers: {
                        some: {
                            group_id: id
                        }
                    }
                }
            });
        } catch (error) {
            return [];
        }
    }
}
