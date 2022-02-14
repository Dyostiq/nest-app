import { Module } from '@nestjs/common';
import { MoviesApplicationModule } from './application';
import { MoviesDomainModule } from './domain';
import { MoviesAdaptersModule } from './infrastructure';
import { MovieController } from './api';
import { JwtAuthModule } from '@app/jwt-auth';

@Module({
  imports: [
    JwtAuthModule,
    MoviesDomainModule,
    MoviesApplicationModule.for([MoviesAdaptersModule]),
  ],
  controllers: [MovieController],
})
export class MoviesModule {}
