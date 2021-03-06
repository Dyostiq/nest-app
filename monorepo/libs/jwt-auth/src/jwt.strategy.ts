import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { IsString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { AuthUser } from './auth-user.type';
import { jwtConfig } from './jwt.config';

class PayloadDto {
  @IsString()
  sub!: string;

  @IsString()
  email!: string;
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
    const payloadInstance = plainToInstance(PayloadDto, payload);
    const errors = validateSync(payloadInstance);
    if (errors.length > 0) {
      throw new UnauthorizedException();
    }

    return { id: payloadInstance.sub, email: payloadInstance.email };
  }
}
