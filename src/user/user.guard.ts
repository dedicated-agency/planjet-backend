import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user_id = this.extractTokenFromHeader(request);
    if(!user_id) throw new UnauthorizedException();
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          telegram_id: Number(user_id)
        }
      });
      if(!user) throw new UnauthorizedException();
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): number | undefined {
    return Number(request.headers.user_id);
  }
}
