import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';

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
}