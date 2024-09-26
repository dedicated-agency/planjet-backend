import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { UserService } from './user.service';

import { privateDecrypt } from 'crypto';

const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user_id = this.extractTransferKey(request);
    if(!user_id) throw new UnauthorizedException();
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          telegram_id: String(user_id)
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
    return Number(request.headers['x-user-id']);
  }

  private extractTransferKey(request: Request): number | undefined {
    const transkerKey = String(request.headers['x-transfer-key']);
    if(transkerKey === 'undefined') return undefined
    const user_id = this.decrypt(transkerKey)
    return Number(user_id);
  }

  decrypt(encryptedData: string): string {
    const decryptedData = privateDecrypt(privateKey, Buffer.from(encryptedData, 'base64'));
    return decryptedData.toString();
}
}
