import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './api/auth.controller';
import {UsersModule} from '../users';
import {PassportModule} from '@nestjs/passport';
import {LocalStrategy} from './passport/local.strategy';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {jwtConfig} from './jwt.config';
import {JwtStrategy} from './passport/jwt.strategy';

const JwtConfigModule = ConfigModule.forFeature(jwtConfig)

@Module({
  imports: [UsersModule, PassportModule, JwtConfigModule, JwtModule.registerAsync({
    imports: [JwtConfigModule],
    useFactory: (
        config: ConfigType<typeof jwtConfig>,
    ) => ({
      secret: config.jwtSecret,
      signOptions: {
        expiresIn: '15m'
      }
    }),
    inject: [jwtConfig.KEY]
  })],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {
}
