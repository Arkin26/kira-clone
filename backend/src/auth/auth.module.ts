import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { PrivyAuthGuard } from './privy-auth.guard';
import { PrivyService } from './privy.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [PrivyService, PrivyAuthGuard],
  exports: [PrivyService, PrivyAuthGuard],
})
export class AuthModule {}
