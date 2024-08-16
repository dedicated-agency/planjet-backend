import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { StatusService } from './status.service';
import { Response} from 'express';
import { UserGuard } from 'src/user/user.guard';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}
  
  @Post()
  @UseGuards(UserGuard)
  async init(
    @Body() data: {
      project_id: number,
      name: string,
      lang: string
    },
    @Res() response: Response
  ){
    return response.json(await this.statusService.init(data))
  }

  @Get(":id")
  @UseGuards(UserGuard)
  async getStatuses(
    @Param("id") id: number,
    @Res() response: Response
  ){
    return response.json(await this.statusService.getStatuses(id))
  }

  @Delete(":id")
  @UseGuards(UserGuard)
  async deleteStatus(
    @Param("id") id: number,
    @Res() response: Response
  ){
    return response.json(await this.statusService.deleteStatus(id))
  }

}
