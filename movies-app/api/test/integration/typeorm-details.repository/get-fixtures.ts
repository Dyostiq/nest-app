import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { clearRepo } from '../../clear-repo';
import { TypeormDetailsRepository } from '../../../src/movies/infrastructure/typeorm-details.repository';
import {
  MovieDetails,
  DetailsRepository,
  MovieCollectionRepository,
} from '../../../src/movies/application';
import {
  MovieCollection,
  MovieCollectionFactory,
  MovieId,
  UserId,
} from '../../../src/movies/domain';
import { CollectionFactory } from '@nestjs/cli/lib/schematics';
import { assertRight } from '../../../src/test/assert-right';
import { isRight } from 'fp-ts/Either';

export function getFixtures() {
  const fixtures: {
    getTypeormDetailsRepository: () => TypeormDetailsRepository;
    sampleDetails: () => [MovieDetails, MovieDetails, MovieDetails];
    aUserHasCollectionWithThreeMovies: () => Promise<
      [MovieId, MovieId, MovieId]
    >;
  } = {
    getTypeormDetailsRepository: () => {
      throw new Error();
    },
    sampleDetails: () => [
      new MovieDetails(
        'Batman',
        '23 Jun 1989',
        'Action, Adventure',
        'Tim Burton',
      ),
      new MovieDetails(
        'Batman Returns',
        '19 Jun 1992',
        'Action, Crime, Fantasy',
        'Tim Burton',
      ),
      new MovieDetails(
        'Batman Forever',
        '16 Jun 1995',
        'Action, Adventure',
        'Joel Schumacher',
      ),
    ],
    aUserHasCollectionWithThreeMovies: () => {
      throw new Error();
    },
  };

  let moduleFixture: TestingModule;
  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await moduleFixture.init();

    await clearRepo(moduleFixture);

    fixtures.getTypeormDetailsRepository = () => {
      const repo = moduleFixture.get(DetailsRepository);
      if (!(repo instanceof TypeormDetailsRepository)) {
        fail();
      }
      return repo;
    };
    fixtures.aUserHasCollectionWithThreeMovies = async () => {
      const repo = moduleFixture.get(MovieCollectionRepository);
      const collectionFactory = moduleFixture.get(MovieCollectionFactory);
      const collection = collectionFactory.createMovieCollection(
        'basic',
        'UTC',
        new UserId('123'),
      );
      const movies = ['Batman', 'Batman Begins', 'Batman Returns']
        .map((title) => collection.createMovie(title))
        .filter(isRight)
        .map((result) => result.right);
      await repo.saveCollection(collection);
      if (movies.length !== 3) throw new Error();
      return [movies[0], movies[1], movies[2]];
    };
    await moduleFixture.init();
  });

  afterEach(async () => {
    await moduleFixture.close();
  });

  return fixtures;
}
