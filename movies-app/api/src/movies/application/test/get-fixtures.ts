import { CreateMovieService } from '../create-movie.service';
import { InMemoryReadService } from './in-memory-read.service';
import { InMemoryCollectionRepository } from './in-memory-collection.repository';
import { InMemoryDetailsRepository } from './in-memory-details.repository';
import { InMemoryDetailsService } from './in-memory-details.service';
import { left } from 'fp-ts/Either';
import { Test } from '@nestjs/testing';
import { MoviesApplicationModule } from '../movies-application.module';
import { MoviesTestAdaptersModule } from './movies-test-adapters.module';
import { MovieCollectionRepository } from '../movie-collection.repository';
import { DetailsRepository } from '../details.repository';
import { DetailsService } from '../details.service';

export function getFixtures() {
  const fixtures: {
    getCreateMovie: () => CreateMovieService;
    getReadService: () => InMemoryReadService;
    detailsServiceUnavailable: () => void;
    collectionRepositoryNotAvailable: () => void;
    detailsRepositoryUnavailable: () => void;
  } = {
    getCreateMovie: () => {
      throw new Error();
    },
    getReadService: () => {
      throw new Error();
    },
    detailsServiceUnavailable: () => {
      throw new Error();
    },
    collectionRepositoryNotAvailable: () => {
      throw new Error();
    },
    detailsRepositoryUnavailable: () => {
      throw new Error();
    },
  };

  let createService: CreateMovieService;
  let readService: InMemoryReadService;
  let collectionRepository: InMemoryCollectionRepository;
  let detailsRepository: InMemoryDetailsRepository;
  let inMemoryDetailsService: InMemoryDetailsService;
  beforeEach(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [MoviesApplicationModule.for([MoviesTestAdaptersModule])],
    }).compile();

    collectionRepository = testingModule.get(MovieCollectionRepository);
    detailsRepository = testingModule.get(DetailsRepository);
    inMemoryDetailsService = testingModule.get(DetailsService);
    createService = testingModule.get(CreateMovieService);

    readService = new InMemoryReadService(
      collectionRepository,
      detailsRepository,
    );

    fixtures.getCreateMovie = () => createService;
    fixtures.getReadService = () => readService;
    fixtures.detailsServiceUnavailable = () => {
      inMemoryDetailsService.fetchDetails = async () =>
        left(new Error('unavailable'));
    };
    fixtures.collectionRepositoryNotAvailable = () => {
      collectionRepository.findUserMovieCollection = async () =>
        left(new Error('unavailable'));
    };
    fixtures.detailsRepositoryUnavailable = () => {
      detailsRepository.save = async () => left(new Error('unavailable'));
    };
  });

  return fixtures;
}
