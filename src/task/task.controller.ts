import { Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { Response } from 'express';
import { UserGuard } from 'src/user/user.guard';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

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
    return response.json(await this.taskService.update(user.id, status, id))
  }


}
