import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AuthModuleOptions, PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConfig } from './jwt.config';
import { JwtStrategy } from './jwt.strategy';

const JwtConfigModule = ConfigModule.forFeature(jwtConfig);

@Module({
  imports: [
    PassportModule.register({}),
    JwtConfigModule,
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.jwtSecret,
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [jwtConfig.KEY],
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtStrategy, JwtModule, PassportModule],
})
export class JwtAuthModule {}
