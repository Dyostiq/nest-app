import { registerAs } from '@nestjs/config';

export const dbConfig = registerAs('db', () => ({
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USERNAME,
  host: process.env.NODE_ENV === 'test' ? 'localhost' : 'db',
}));
