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

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public', // optional, defaults to '/'
    }),
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    GramBotModule,
    UserModule,
    GroupModule,
    ProjectModule,
    TaskModule,
    StatusModule
  ],
  controllers: [],
  providers: [PrismaService, UserService],
})
export class AppModule {}
