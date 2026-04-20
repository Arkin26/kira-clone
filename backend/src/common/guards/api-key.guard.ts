import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * When `API_KEY` is set in the environment, requires `X-API-Key` header on mutating routes.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('API_KEY');
    if (!expected?.trim()) {
      return true;
    }
    const req = context.switchToHttp().getRequest<Request>();
    const key = req.header('x-api-key');
    if (key !== expected) {
      throw new UnauthorizedException('Invalid or missing X-API-Key');
    }
    return true;
  }
}
