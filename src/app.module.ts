import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GramBotModule } from './gram_bot/gram_bot.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma.service';
import { UserService } from './user/user.service';
import { GroupModule } from './group/group.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { StatusModule } from './status/status.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PhotoModule } from './photo/photo.module';
import { NotificationService } from './notification/notification.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    GramBotModule,
    UserModule,
    GroupModule,
    ProjectModule,
    TaskModule,
    StatusModule,
    PhotoModule,
    AuthModule,
  ],
  controllers: [],
  providers: [PrismaService, UserService, NotificationService],
})
export class AppModule {}
