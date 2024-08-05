import { Injectable } from '@nestjs/common';
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
                telegram_id: Number(id)
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
                    telegram_id: Number(id),
                    name: first_name,
                    username,
                    language_code,
                }
            });  
        }

        return check
    }
}
