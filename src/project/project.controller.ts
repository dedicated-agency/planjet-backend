import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Response } from 'express';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get("show/:project_id")
  @UseGuards(UseGuards)
  async showById(
    @Param("project_id") project_id: number,
    @Res() response: Response,
    @Query("status") status: number,
    @Query("user_id") user_id: number
  ){
    console.log({status});
    
    return response.json(await this.projectService.showById({project_id, status, user_id}))
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
  @UseGuards(UseGuards)
  async main(
    @Param("group_id") group_id: number,
    @Res() response: Response
  ){
    return response.json(await this.projectService.main(group_id))
  }
}
