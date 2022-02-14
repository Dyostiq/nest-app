import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { IsIn, IsNumber, IsString, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

import { AuthUser } from './auth-user.type';
import { jwtConfig } from './jwt.config';

class PayloadDto {
  @IsNumber()
  userId!: number;

  @IsString()
  name!: string;

  @IsIn(['basic', 'premium'])
  role!: 'basic' | 'premium';
}

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  async validate(payload: unknown): Promise<AuthUser> {
    const payloadInstance = plainToClass(PayloadDto, payload);
    const errors = validateSync(payloadInstance);
    if (errors.length > 0) {
      throw new UnauthorizedException();
    }

    return {
      userId: payloadInstance.userId,
      role: payloadInstance.role,
      name: payloadInstance.name,
    };
  }
}
