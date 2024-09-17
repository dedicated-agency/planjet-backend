import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {

    constructor(
        private readonly prisma: PrismaService
    ){}

    async init(data: {
        id: number,
        first_name: string,
        username:string,
        language_code:string,
    } ){
        const {id, first_name, username, language_code} = data;
        const check = await this.prisma.user.findUnique({
            where: {
                telegram_id: String(id)
            },
            include: {
                tasks: true,
                groupUsers: {
                    include: {
                        group: true
                    }
                }
            }
        });

        if (!check) 
        {
            return await this.prisma.user.create({
                data: {
                    telegram_id: String(id),
                    name: first_name,
                    username,
                    language_code: language_code ? language_code : "en",
                }
            });  
        }

        return check
    }

    async tasks(user_id: string, status: number)
    {
        let project = await this.prisma.project.findFirst({
            where: {
                topic_id: user_id,
                name: "mytasks"
            }
        });

        if(!project){
            project = await this.prisma.project.create({
                data: {
                    topic_id: user_id,
                    name: "mytasks"
                }
            });


            let statuses: any = await this.prisma.status.findMany({
                where: {
                    project_id: Number(project.id)
                }
            });

            // if(statuses.length === 0)
            // {
            //     statuses = await this.prisma.status.createMany({
            //         data: this.statusList.map((element) => ({
            //             name: element.name,
            //             order: element.id,
            //             project_id: Number(project.id) 
            //         }))
            //     });
            // }

            const status = await this.prisma.status.findFirst({
                where: {
                    project_id: Number(project.id)
                },
                orderBy: {
                    order: "asc"
                }
            })
        } 

        const project_id = project.id;

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

    async events(user_id: string)
    {
        const checkUser = await this.prisma.user.findUnique({
            where: {
                telegram_id: user_id
            }
        });
        if(!checkUser) return [];
        const events = await this.prisma.notification.findMany({
            where: {
                user_id: checkUser.telegram_id,
                is_viewed: '0'
            },
            include: {
                change: {
                    include: {
                        task: {
                            include: {
                                project: true
                            }
                        }
                    }
                }
            }
        });

        return events;
    }
}
