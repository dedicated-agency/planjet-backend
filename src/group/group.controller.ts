import { Body, Controller, Get, Headers, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { Response } from 'express';
import { UserGuard } from 'src/user/user.guard';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @UseGuards(UserGuard)
  async main(
    @Req() req,
    @Res() response: Response
  ){
    const {user} = req;
    return response.json(await this.groupService.main(user.telegram_id))
  }

  @Post("init")
  async init(
    @Body() data: {
      id: number,
      name: string
    },
    @Res() response: Response
  ){
    return response.json(await this.groupService.init(data));
  }

  @Get(":id")
  @UseGuards(UserGuard)
  async showbyId(
    @Param("id") id: number,
    @Req() req,
    @Res() response: Response
  ){
    const {user} = req;
    return response.json(await this.groupService.showById(user.id, id))
  }
}
