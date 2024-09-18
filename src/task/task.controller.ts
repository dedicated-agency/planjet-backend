import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { Response } from 'express';
import { UserGuard } from 'src/user/user.guard';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('create')
  @UseGuards(UserGuard)
  async create(
    @Body() data:  {
      project_id: number,
      name: string,
      description: string,
      deadline: string,
      participant: number[],
      priority: number,
      point: number
    },
    @Res() response: Response,
    @Req() req,
  ){
    const {user} = req;
    return response.json(await this.taskService.create(data, user.telegram_id));
  }

  @Post('init')
  async init(
    @Body() data:  {
      project_id: number,
      message_id: number,
      user_id: number,
      name: string,
    },
    @Res() response: Response
  ){
    return response.json(await this.taskService.init(data));
  }

  @Get("show/:id")
  @UseGuards(UserGuard)
  async show(
    @Req() req,
    @Res() response: Response,
    @Param("id") id: number,
  ){
    const {user} = req;
    return response.json(await this.taskService.show(id))
  }


  @Get(":id/:status")
  @UseGuards(UserGuard)
  async tasks(
    @Req() req,
    @Res() response: Response,
    @Param("id") id: number,
    @Param("status") status: number,
  ){
    const {user} = req;
    return response.json(await this.taskService.tasks(user.id, status, id))
  }

  @Put(":id/status")
  @UseGuards(UserGuard)
  async updateStatus(
    @Req() req,
    @Res() response: Response,
    @Param("id") id: number,
    @Body("status") status: number,    
  ){
    const {user} = req;
    return response.json(await this.taskService.updateStatus(user.telegram_id, status, id))
  }


  @Put(":id/priority")
  @UseGuards(UserGuard)
  async updatePriority(
    @Req() req,
    @Res() response: Response,
    @Param("id") id: number,
    @Body("priority") priority: number,    
  ){
    const {user} = req;
    return response.json(await this.taskService.updatePriority(user.telegram_id, priority, id))
  }


  @Delete(":id")
  @UseGuards(UserGuard)
  async deleteUser(
    @Req() req,
    @Res() response: Response,
    @Param("id") id: number,
  ){
    const {user} = req;
    return response.json(await this.taskService.delete(user.telegram_id, id))
  }

  @Put(":id/archive")
  @UseGuards(UserGuard)
  async archive(
    @Req() req,
    @Res() response: Response,
    @Param("id") id: number,
    @Body("archive") archive: any, 
  ){
    const {user} = req;
    return response.json(await this.taskService.archive(user.telegram_id, id, archive))
  }

  @Put(":id/comment")
  @UseGuards(UserGuard)
  async comment(
    @Req() req,
    @Res() response: Response,
    @Param("id") id: number,
    @Body("text") text: string, 
  ){
    const {user} = req;
    return response.json(await this.taskService.comment(user.telegram_id, id, text))
  }

  @Put(':id/participant')
  @UseGuards(UserGuard)
  async participant(
    @Body("participant") participant: number[],
    @Res() response: Response,
    @Req() req,
    @Param("id") id: number,
  ){
    const {user} = req;
    return response.json(await this.taskService.participant(id, participant, user.telegram_id));
  }

}
