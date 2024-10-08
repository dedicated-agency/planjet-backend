import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get()
  showInitData(@Res() res: Response) {
    const initData = res.locals.initData;
    if (!initData) {
      throw new Error('Init data not found');
    }
    return res.json(initData);
  }
}
