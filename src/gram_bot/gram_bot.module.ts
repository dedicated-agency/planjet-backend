import { Module } from '@nestjs/common';
import { GramBotService } from './gram_bot.service';
import { GramBotController } from './gram_bot.controller';
import { PrismaService } from 'src/prisma.service';
import { TaskService } from 'src/task/task.service';
import { GroupService } from 'src/group/group.service';
import { StatusService } from 'src/status/status.service';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [GramBotController],
  providers: [
    GramBotService, 
    PrismaService, 
    TaskService,
    GroupService,
    StatusService,
    ProjectService,
    UserService
  ],
})
export class GramBotModule {}
