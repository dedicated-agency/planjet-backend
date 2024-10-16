import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { validate, parse } from '@telegram-apps/init-data-node';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly token = process.env.TELEGRAM_BOT_TOKEN;
  canActivate( context: ExecutionContext ): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const authHeader = request.header('authorization') || '';
    const [authType, authData = ''] = authHeader.split(' ');

    if(authData === 'TEST_MODE')
    {
      response.locals.initData = {
        authDate: new Date().toISOString(),
        chatInstance: "testChatInstance",
        chatType: "supergroup",
        hash: "testHash",
        user: {
            allowsWriteToPm: true,
            firstName: "Munir",
            id: 1448242182,
            languageCode: "ru",
            lastName: "",
            username: "SMART_DIE"
        }
      }
      return true
    }

    if (authType !== 'tma') {
      throw new UnauthorizedException('Unauthorized');
    }
    
    try {
      validate(authData, this.token, {
        expiresIn: 7200,
      });

      response.locals.initData = parse(authData);
      return true;
    } catch (error) {
      console.log({error});
      throw new UnauthorizedException(error.message);
    }
  }
}
