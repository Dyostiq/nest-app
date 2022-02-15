import { assertRight } from '../../test/assert-right';
import { Either, left } from 'fp-ts/Either';
import { assertLeft } from '../../test/assert-left';
import { MovieId } from '../domain';
import {
  CreateMovieService,
  CreateMovieApplicationError,
  serviceUnavailableError,
} from './create-movie.service';
import { InMemoryReadService } from './test/in-memory-read.service';
import { InMemoryCollectionRepository } from './test/in-memory-collection.repository';
import { InMemoryDetailsRepository } from './test/in-memory-details.repository';
import { Test } from '@nestjs/testing';
import { MoviesApplicationModule } from './movies-application.module';
import { MoviesTestAdaptersModule } from './test/movies-test-adapters.module';
import { MovieCollectionRepository } from './movie-collection.repository';
import { DetailsRepository } from './details.repository';
import { DetailsService } from './details.service';

let fixtures: Awaited<ReturnType<typeof getFixtures>>;
let createService: CreateMovieService;
let readService: InMemoryReadService;
beforeEach(async () => {
  fixtures = await getFixtures();
  createService = fixtures.getCreateMovie();
  readService = fixtures.getReadService();
});

test(`a user without a collection should be able to create a movie`, async () => {
  // given
  // when
  const result = await createService.createMovie('Batman', '123');
  // then
  assertRight(result);
  // and
  expect(await readService.getMovies('123')).toStrictEqual([
    {
      id: expect.any(String),
      title: 'Batman',
      released: '23 Jun 1989',
      genre: 'Action, Adventure',
      director: 'Tim Burton',
    },
  ]);
});

test(`a user with a collection should be able to create a movie`, async () => {
  // given
  await createService.createMovie('Batman', '123');
  // when
  await createService.createMovie('Batman Returns', '123');
  // then
  expect(await readService.getMovies('123')).toStrictEqual([
    {
      id: expect.any(String),
      title: 'Batman',
      released: '23 Jun 1989',
      genre: 'Action, Adventure',
      director: 'Tim Burton',
    },
    {
      id: expect.any(String),
      title: 'Batman Returns',
      released: '19 Jun 1992',
      genre: 'Action, Crime, Fantasy',
      director: 'Tim Burton',
    },
  ]);
});

describe(`when a details service is not available`, () => {
  let result: Either<CreateMovieApplicationError, MovieId>;
  beforeEach(async () => {
    // given
    fixtures.detailsServiceUnavailable();

    // when
    result = await createService.createMovie('Batman', '123');
  });

  // then
  it(`should return an error`, async () => {
    assertLeft(result);
    expect(result.left).toBe(serviceUnavailableError);
  });

  // and
  it(`should not create a movie`, async () => {
    expect(await readService.getMovies('123')).toStrictEqual([]);
  });
});

describe(`when a details repository is not available`, () => {
  let result: Either<CreateMovieApplicationError, MovieId>;
  beforeEach(async () => {
    // given
    fixtures.detailsRepositoryUnavailable();

    // when
    result = await createService.createMovie('Batman', '123');
  });

  // then
  it(`should return an error`, async () => {
    assertLeft(result);
    expect(result.left).toBe(serviceUnavailableError);
  });

  // and
  it(`should not create a movie`, async () => {
    expect(await readService.getMovies('123')).toStrictEqual([]);
  });
});

describe(`when a collection repository is not available`, () => {
  let result: Either<CreateMovieApplicationError, MovieId>;
  beforeEach(async () => {
    // given
    fixtures.collectionRepositoryNotAvailable();

    // when
    result = await createService.createMovie('Batman', '123');
  });

  // then
  it(`should return an error`, async () => {
    assertLeft(result);
    expect(result.left).toBe(serviceUnavailableError);
  });

  // and
  it(`should not create a movie`, async () => {
    expect(await readService.getMovies('123')).toStrictEqual([]);
  });
});

export async function getFixtures() {
  const testingModule = await Test.createTestingModule({
    imports: [MoviesApplicationModule.for([MoviesTestAdaptersModule])],
  }).compile();

  const collectionRepository: InMemoryCollectionRepository = testingModule.get(
    MovieCollectionRepository,
  );
  const detailsRepository: InMemoryDetailsRepository =
    testingModule.get(DetailsRepository);
  const inMemoryDetailsService = testingModule.get(DetailsService);
  const createService = testingModule.get(CreateMovieService);

  readService = new InMemoryReadService(
    collectionRepository,
    detailsRepository,
  );

  return {
    getCreateMovie: () => createService,
    getReadService: () => readService,
    detailsServiceUnavailable: () => {
      inMemoryDetailsService.fetchDetails = async () =>
        left(new Error('unavailable'));
    },
    collectionRepositoryNotAvailable: () => {
      collectionRepository.findUserMovieCollection = async () =>
        left(new Error('unavailable'));
    },
    detailsRepositoryUnavailable: () => {
      detailsRepository.save = async () => left(new Error('unavailable'));
    },
  };
}
