import { Test } from '@nestjs/testing';
import { MoviesDomainModule } from '../index';
import { MovieCollectionFactory } from '../index';
import { UserId } from '../index';
import { MovieCollection } from '../index';

export function getFixtures() {
  const fixtures: {
    aBasicUserMovieCollection: () => MovieCollection;
    aPremiumUserMovieCollection: () => MovieCollection;
  } = {
    aBasicUserMovieCollection: () => {
      throw new Error();
    },
    aPremiumUserMovieCollection: () => {
      throw new Error();
    },
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [MoviesDomainModule],
    }).compile();

    const movieCollectionFactory = testingModule.get(MovieCollectionFactory);
    fixtures.aBasicUserMovieCollection = () =>
      movieCollectionFactory.createMovieCollection(
        'basic',
        'America/New_York',
        new UserId('basic user'),
      );
    fixtures.aPremiumUserMovieCollection = () =>
      movieCollectionFactory.createMovieCollection(
        'premium',
        'America/New_York',
        new UserId('premium'),
      );
  });

  return fixtures;
}
