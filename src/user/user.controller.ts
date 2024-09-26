import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { UserGuard } from './user.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("init")
  async init(
    @Body() data: {
      id: number,
      first_name: string,
      last_name:string,
      username:string,
      language_code:string,
      allows_write_to_pm: boolean
    },
    @Res() response: Response
  ){
    return response.json(await this.userService.init(data));
  }

  @Get("tasks")
  @UseGuards(UserGuard)
  async tasks(
    @Req() req,
    @Res() response: Response,
    @Query("status") status: string,
  ){
    const {user} = req;
    return response.json(await this.userService.tasks(user.telegram_id, status));
  }

  @Get("tasks/header")
  @UseGuards(UserGuard)
  async tasksHeader(
    @Req() req,
    @Res() response: Response,
  ){
    const {user} = req;
    return response.json(await this.userService.tasksHeader(user.telegram_id));
  }

  @Get("status")
  @UseGuards(UserGuard)
  async status(
    @Req() req,
    @Res() response: Response,
  ){
    const {user} = req;
    return response.json(await this.userService.tasks(user.telegram_id, 'To do'));
  }

  @Get("events")
  @UseGuards(UserGuard)
  async events(
    @Req() req,
    @Res() response: Response,
    @Query("is_viewed") is_viewed: string
  )
  {
    const {user} = req;
    return response.json(await this.userService.events(user.telegram_id, is_viewed));
  }

  @Get("groups")
  @UseGuards(UserGuard)
  async groups(
    @Req() req,
    @Res() response: Response,
  ){
    const {user} = req;
    return response.json(await this.userService.groups(user.telegram_id));
  }

  @Get("checkrypt")
  @UseGuards(UserGuard)
  async checkdata(
    @Req() req,
  )
  {
    const {user} = req;
    return  user
  }
}