import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaService } from 'src/prisma.service';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService, PrismaService, NotificationService],
})
export class TaskModule {}
