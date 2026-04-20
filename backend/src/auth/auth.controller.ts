import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

import { PrismaService } from '../prisma/prisma.service';
import { PrivyAuthGuard, type RequestWithPrivyUser } from './privy-auth.guard';

class BindMerchantDto {
  @IsString()
  @IsNotEmpty()
  merchantId!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns Privy user id and optional bound merchant row. */
  @Get('me')
  @UseGuards(PrivyAuthGuard)
  async me(@Req() req: RequestWithPrivyUser) {
    const merchant = await this.prisma.merchant.findFirst({
      where: { privyUserId: req.privyUserId },
      select: { id: true },
    });
    return { userId: req.privyUserId, merchantId: merchant?.id ?? null };
  }

  /** Associates the authenticated Privy user with a merchant id (dashboard identity). */
  @Post('bind-merchant')
  @UseGuards(PrivyAuthGuard)
  async bindMerchant(@Req() req: RequestWithPrivyUser, @Body() body: BindMerchantDto) {
    const existing = await this.prisma.merchant.findUnique({
      where: { id: body.merchantId },
    });
    if (!existing) {
      return { ok: false as const, error: 'Merchant not found' };
    }
    if (existing.privyUserId && existing.privyUserId !== req.privyUserId) {
      return { ok: false as const, error: 'Merchant already bound to another user' };
    }
    await this.prisma.merchant.update({
      where: { id: body.merchantId },
      data: { privyUserId: req.privyUserId },
    });
    return { ok: true as const, merchantId: body.merchantId };
  }
}
