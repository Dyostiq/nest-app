import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from './jwt.config';

@Module({
  imports: [PassportModule, ConfigModule.forFeature(jwtConfig)],
  providers: [JwtStrategy],
  controllers: [],
})
export class AuthModule {}
