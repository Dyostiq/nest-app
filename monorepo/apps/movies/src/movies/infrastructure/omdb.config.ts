import { registerAs } from '@nestjs/config';

export const omdbConfig = registerAs('omdb', () => ({
  apikey: process.env.OMDB_API_KEY,
}));
