import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  jwtSecret: process.env.JWT_SECRET,
}));
