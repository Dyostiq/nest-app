import { Module } from '@nestjs/common';
import { MoviesDomainModule } from '../../domain';
import { MovieCollectionRepository } from '../movie-collection.repository';
import { InMemoryCollectionRepository } from './in-memory-collection.repository';
import { DetailsRepository } from '../details.repository';
import { InMemoryDetailsRepository } from './in-memory-details.repository';
import { DetailsService } from '../details.service';
import { InMemoryDetailsService } from './in-memory-details.service';
import { AlwaysBasicUserStatusRepository } from './always-basic-user-status.repository';
import { UserStatusRepository } from '../user-status.repository';

@Module({
  imports: [MoviesDomainModule],
  providers: [
    InMemoryCollectionRepository,
    InMemoryDetailsRepository,
    InMemoryDetailsService,
    AlwaysBasicUserStatusRepository,
    {
      provide: MovieCollectionRepository,
      useExisting: InMemoryCollectionRepository,
    },
    {
      provide: DetailsRepository,
      useExisting: InMemoryDetailsRepository,
    },
    {
      provide: DetailsService,
      useExisting: InMemoryDetailsService,
    },
    {
      provide: UserStatusRepository,
      useExisting: AlwaysBasicUserStatusRepository,
    },
  ],
  exports: [MovieCollectionRepository, DetailsRepository, DetailsService],
})
export class MoviesTestAdaptersModule {}
