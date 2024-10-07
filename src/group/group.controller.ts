import { Body, Controller, Get, Headers, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { Response } from 'express';
import { UserGuard } from 'src/user/user.guard';

interface selectGroup {
  is_selected: boolean
  group_id: string
}


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

  @Get("selected")
  @UseGuards(UserGuard)
  async selectedGroups(
    @Req() req,
    @Res() response: Response
  ){
    const {user} = req;
    return response.json(await this.groupService.selectedGroups(user.telegram_id))
  }

  @Post("selector")
  @UseGuards(UserGuard)
  async selector(
    @Req() req,
    @Res() response: Response,
    @Body() data: selectGroup[]
  ){
    const {user} = req;
    return response.json(await this.groupService.selector(user.telegram_id, data))
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
    return response.json(await this.groupService.showById(user.telegram_id, id))
  }

  @Put(":id")
  @UseGuards(UserGuard)
  async selected(
    @Body("is_selected") is_selected: string,
    @Req() req,
    @Res() response: Response,
    @Param("id") id: string,
  ){
    const {user} = req;
    return response.json(await this.groupService.selected(id, is_selected, user.telegram_id))
  }

  @Get(":id/users")
  @UseGuards(UserGuard)
  async users(
    @Req() req,
    @Res() response: Response,
    @Param("id") id: string,
  ){
    const {user} = req;
    return response.json(await this.groupService.users(id, user.telegram_id))
  }

}
