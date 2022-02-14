import { assertRight } from '../../test/assert-right';
import { Either } from 'fp-ts/Either';
import { assertLeft } from '../../test/assert-left';
import { MovieId } from '../domain';
import {
  CreateMovieService,
  CreateMovieApplicationError,
} from './create-movie.service';
import { InMemoryReadService } from './test/in-memory-read.service';
import { getFixtures } from './test/get-fixtures';

const fixtures = getFixtures();

let createService: CreateMovieService;
let readService: InMemoryReadService;
beforeEach(() => {
  createService = fixtures.getCreateMovie();
  readService = fixtures.getReadService();
});

test(`a user without a collection should be able to create a movie`, async () => {
  // given
  // when
  const result = await createService.createMovie('Batman', '123', 'basic');
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
  await createService.createMovie('Batman', '123', 'basic');
  // when
  await createService.createMovie('Batman Returns', '123', 'basic');
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
    result = await createService.createMovie('Batman', '123', 'basic');
  });

  // then
  it(`should return an error`, async () => {
    assertLeft(result);
    expect(result.left).toBe('service unavailable');
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
    result = await createService.createMovie('Batman', '123', 'basic');
  });

  // then
  it(`should return an error`, async () => {
    assertLeft(result);
    expect(result.left).toBe('service unavailable');
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
    result = await createService.createMovie('Batman', '123', 'basic');
  });

  // then
  it(`should return an error`, async () => {
    assertLeft(result);
    expect(result.left).toBe('service unavailable');
  });

  // and
  it(`should not create a movie`, async () => {
    expect(await readService.getMovies('123')).toStrictEqual([]);
  });
});
