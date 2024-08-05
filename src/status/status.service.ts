import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StatusService {
    private defaultStatuses = {
        uz: {
            todo: "Qilish kerak",
            progress: "Bajarilmoqda",
            test: "Sinov",
            completed: "Tugallangan",
            cancelled: "Bekor qilingan"
        },
        en: {
            todo: "To do",
            progress: "In Progress",
            test: "Testing",
            completed: "Completed",
            cancelled: "Cancelled"
        },
        ru: {
            todo: "К выполнению",
            progress: "В процессе",
            test: "На проверке",
            completed: "Завершено",
            cancelled: "Отменено"
        }
    }
    constructor(
        private readonly prisma: PrismaService
    ){}

    async init(data: {
        project_id: number,
        name: string,
        lang: string
    }){
        const {project_id, name, lang} = data;
        const check = await this.prisma.status.findFirst({
            where: {
                project_id: Number(project_id),
                name,
            }
        });
        if(!check){
            const count = (await this.prisma.status.findMany({
                where: {
                    project_id: Number(project_id)
                }
            })).length;
            await this.prisma.status.create({
                data: {
                    project_id: Number(project_id),
                    name,
                    order: Number(count + 1)
                } 
            }) 
        }
        return true;
    }

    async defaultMaker(project_id: number, lang: string)
    {
        if(!lang)
        {
            lang = 'en'
        }
        const data = this.defaultStatuses[lang];
        try {
            await this.prisma.status.createMany({
                data: [
                    {
                        project_id: Number(project_id),
                        name: data.todo,
                        order: 1
                    },
                    {
                        project_id: Number(project_id),
                        name: data.progress,
                        order: 2
                    },
                    {
                        project_id: Number(project_id),
                        name: data.test,
                        order: 3
                    },
                    {
                        project_id: Number(project_id),
                        name: data.completed,
                        order: 4
                    },
                    {
                        project_id: Number(project_id),
                        name: data.cancelled,
                        order: 5
                    }
                ]
            })
        } catch (error) {
            console.log("Default status create error: " + error);
        }
    }

    async getStatuses(id: number)
    {
        try {
            return await this.prisma.status.findMany({
                where: {
                    project_id: Number(id)
                },
                include: {
                    tasks: true
                }
            });
        } catch (error) {
            console.log("Get Status error: " + error);
        }
    }
}
