import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './api/auth.controller';
import { UsersModule } from '../users';
import { LocalStrategy } from './passport/local.strategy';
import { JwtAuthModule } from '@app/jwt-auth';

@Module({
  imports: [UsersModule, JwtAuthModule],
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
