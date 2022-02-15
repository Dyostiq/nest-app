import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieCollectionEntity } from './movie-collection.entity';
import { MovieEntity } from './movie.entity';
import {
  GetMoviesService,
  MovieCollectionRepository,
  UserStatusRepository,
} from '../application';
import { TypeormMovieCollectionRepository } from './typeorm-movie-collection.repository';
import { MoviesDomainModule } from '../domain';
import { DetailsEntity } from './details.entity';
import { DetailsRepository, DetailsService } from '../application';
import { TypeormDetailsRepository } from './typeorm-details.repository';
import { OmdbDetailsService } from './omdb-details.service';
import { ConfigModule } from '@nestjs/config';
import { omdbConfig } from './omdb.config';
import { TypeormGetMoviesService } from './typeorm-get-movies.service';
import { UserStatusRepositoryAdapter } from './user-status-repository.adapter';
import { UserStatusModule } from '../../user-status';

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
    UserStatusModule,
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
    {
      provide: UserStatusRepository,
      useClass: UserStatusRepositoryAdapter,
    },
  ],
  exports: [
    MovieCollectionRepository,
    DetailsRepository,
    DetailsService,
    GetMoviesService,
    UserStatusRepository,
  ],
})
export class MoviesAdaptersModule {}
