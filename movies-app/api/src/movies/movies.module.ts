import { Module } from '@nestjs/common';
import { MoviesApplicationModule } from './application';
import { MoviesDomainModule } from './domain';
import { MoviesAdaptersModule } from './infrastructure';
import { MovieController } from './api';

@Module({
  imports: [
    MoviesDomainModule,
    MoviesApplicationModule.for([MoviesAdaptersModule]),
  ],
  controllers: [MovieController],
})
export class MoviesModule {}
