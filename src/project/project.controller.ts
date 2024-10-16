import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Response } from 'express';
import { UserGuard } from 'src/user/user.guard';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get("show/:project_id")
  @UseGuards(UserGuard)
  async showById(
    @Param("project_id") project_id: number,
    @Res() response: Response,
    @Query("status") status: number,
    @Query("user_ids") ids: string
  ){
    return response.json(await this.projectService.showById({project_id, status, user_ids: ids ? ids.split(',').map(String) : []}))
  }

  @Post('init')
  async init(
    @Body() data: {
      groupId: number,
      id: number,
      name: string
    },
    @Res() response: Response 
  ){
    return response.json(await this.projectService.init(data));
  }

  @Get(":group_id")
  @UseGuards(UserGuard)
  async main(
    @Param("group_id") group_id: number,
    @Res() response: Response
  ){
    return response.json(await this.projectService.main(group_id))
  }

  @Delete(":id")
  @UseGuards(UserGuard)
  async deleteFunc(
    @Param("id") id: number,
    @Res() response: Response,
  ){
    return response.json(await this.projectService.deleteFunc(id))
  }

  @Put(":id/notification")
  @UseGuards(UserGuard)
  async notification(
    @Param("id") id: number,
    @Res() response: Response,
    @Body("type") type: string,
    @Body("value") value: boolean
  ){
    return response.json(await this.projectService.notification(id, type, value))
  }

  @Get(":id/archive")
  @UseGuards(UserGuard)
  async archives(
    @Param("id") id: number,
    @Res() response: Response,
  ){
    return response.json(await this.projectService.archives(id))
  }
}
