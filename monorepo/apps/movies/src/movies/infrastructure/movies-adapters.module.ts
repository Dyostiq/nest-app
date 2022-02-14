import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieCollectionEntity } from './movie-collection.entity';
import { MovieEntity } from './movie.entity';
import { GetMoviesService, MovieCollectionRepository } from '../application';
import { TypeormMovieCollectionRepository } from './typeorm-movie-collection.repository';
import { MoviesDomainModule } from '../domain';
import { DetailsEntity } from './details.entity';
import { DetailsRepository, DetailsService } from '../application';
import { TypeormDetailsRepository } from './typeorm-details.repository';
import { OmdbDetailsService } from './omdb-details.service';
import { ConfigModule } from '@nestjs/config';
import { omdbConfig } from './omdb.config';
import { TypeormGetMoviesService } from './typeorm-get-movies.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovieCollectionEntity,
      MovieEntity,
      DetailsEntity,
    ]),
    MoviesDomainModule,
    HttpModule,
    ConfigModule.forFeature(omdbConfig),
  ],
  providers: [
    {
      provide: MovieCollectionRepository,
      useClass: TypeormMovieCollectionRepository,
    },
    {
      provide: DetailsRepository,
      useClass: TypeormDetailsRepository,
    },
    {
      provide: DetailsService,
      useClass: OmdbDetailsService,
    },
    {
      provide: GetMoviesService,
      useClass: TypeormGetMoviesService,
    },
  ],
  exports: [
    MovieCollectionRepository,
    DetailsRepository,
    DetailsService,
    GetMoviesService,
  ],
})
export class MoviesAdaptersModule {}
