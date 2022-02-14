import { Module } from '@nestjs/common';
import { MoviesDomainModule } from '../../domain';
import { MovieCollectionRepository } from '../movie-collection.repository';
import { InMemoryCollectionRepository } from './in-memory-collection.repository';
import { DetailsRepository } from '../details.repository';
import { InMemoryDetailsRepository } from './in-memory-details.repository';
import { DetailsService } from '../details.service';
import { InMemoryDetailsService } from './in-memory-details.service';

@Module({
  imports: [MoviesDomainModule],
  providers: [
    {
      provide: MovieCollectionRepository,
      useClass: InMemoryCollectionRepository,
    },
    {
      provide: DetailsRepository,
      useClass: InMemoryDetailsRepository,
    },
    {
      provide: DetailsService,
      useClass: InMemoryDetailsService,
    },
  ],
  exports: [MovieCollectionRepository, DetailsRepository, DetailsService],
})
export class MoviesTestAdaptersModule {}
