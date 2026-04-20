import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyAccessToken } from '@privy-io/node';
import { createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';

/**
 * Verifies Privy-issued access tokens (JWT) via JWKS.
 */
@Injectable()
export class PrivyService {
  private readonly appId: string;
  private jwks: JWTVerifyGetKey | null = null;

  constructor(private readonly config: ConfigService) {
    this.appId = this.config.get<string>('PRIVY_APP_ID')?.trim() ?? '';
    const jwksUrl =
      this.config.get<string>('PRIVY_APP_JWKS_URL')?.trim() ||
      (this.appId ? `https://auth.privy.io/api/v1/apps/${this.appId}/jwks.json` : '');
    if (this.appId && jwksUrl) {
      this.jwks = createRemoteJWKSet(new URL(jwksUrl));
    }
  }

  isEnabled(): boolean {
    return Boolean(this.appId && this.jwks);
  }

  async verifyBearerToken(token: string) {
    if (!this.jwks || !this.appId) {
      throw new UnauthorizedException('Privy is not configured on the server');
    }
    try {
      return await verifyAccessToken({
        access_token: token,
        app_id: this.appId,
        verification_key: this.jwks,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
