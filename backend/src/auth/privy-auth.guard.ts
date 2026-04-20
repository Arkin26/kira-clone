import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { PrivyService } from './privy.service';

export type RequestWithPrivyUser = Request & { privyUserId: string };

@Injectable()
export class PrivyAuthGuard implements CanActivate {
  constructor(private readonly privy: PrivyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.privy.isEnabled()) {
      throw new UnauthorizedException('Privy auth is not configured');
    }
    const req = context.switchToHttp().getRequest<RequestWithPrivyUser>();
    const auth = req.header('authorization');
    const m = /^Bearer\s+(.+)$/i.exec(auth ?? '');
    if (!m?.[1]) {
      throw new UnauthorizedException('Missing Authorization Bearer token');
    }
    const result = await this.privy.verifyBearerToken(m[1].trim());
    req.privyUserId = result.user_id;
    return true;
  }
}
