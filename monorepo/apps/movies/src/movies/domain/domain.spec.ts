import { isRight } from 'fp-ts/Either';
import { assertRight } from '../../test/assert-right';
import { withTime } from './test/with-time';
import { assertLeft } from '../../test/assert-left';
import { Test } from '@nestjs/testing';
import { MoviesDomainModule } from './movies-domain.module';
import { MovieCollectionFactory } from './movie-collection.factory';
import { UserId } from './user.id';

let fixtures: Awaited<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`a user can create a movie`, async () => {
  // given
  const movies = fixtures.aBasicUserMovieCollection();
  // when
  const result = movies.createMovie('Batman');
  // then
  assertRight(result);
});

test(`a movie in collection should be rollbackable`, async () => {
  // given
  const movies = fixtures.aBasicUserMovieCollection();
  // and
  movies.createMovie('Batman');
  movies.createMovie('Batman Returns');
  // when
  const result = movies.rollbackMovie('Batman Returns');
  // then
  assertRight(result);
  // and
  expect(movies.listMovies()).toStrictEqual(['Batman']);
});

test(`only a movie that exists can be rollbacked`, async () => {
  // given
  const movies = fixtures.aBasicUserMovieCollection();
  // and
  movies.createMovie('Batman');
  // when
  const result = movies.rollbackMovie('Batman Returns');
  // then
  assertLeft(result);
  // and
  expect(movies.listMovies()).toStrictEqual(['Batman']);
});

test(`movies should not duplicate`, async () => {
  // given
  const movies = fixtures.aBasicUserMovieCollection();
  // and
  assertRight(movies.createMovie('Batman'));
  // when
  const result = movies.createMovie('Batman');
  // then
  assertLeft(result);
});

withTime('2020-02-05T00:00:00-05:00', () => {
  test(`a basic user can create up to 5 movies in a month`, async () => {
    // given
    const movies = fixtures.aBasicUserMovieCollection();
    // when
    const results = [
      movies.createMovie('Batman'),
      movies.createMovie('Batman Returns'),
      movies.createMovie('Batman Forever'),
      movies.createMovie('Batman & Robin'),
      movies.createMovie('Batman Begins'),
    ];
    // then
    results.forEach((result) => assertRight(result));
    // and
    expect(movies.listMovies()).toStrictEqual([
      'Batman',
      'Batman Returns',
      'Batman Forever',
      'Batman & Robin',
      'Batman Begins',
    ]);
  });

  test(`a basic user can create sixth movie when one was rollbacked`, async () => {
    // given
    const movies = fixtures.aBasicUserMovieCollection();
    // and
    movies.createMovie('Batman');
    movies.createMovie('Batman Returns');
    movies.createMovie('Batman Forever');
    movies.createMovie('Batman & Robin');
    movies.createMovie('Batman Begins');
    // and
    movies.rollbackMovie('Batman Returns');
    // when
    const result = movies.createMovie('The Dark Knight');
    // then
    assertRight(result);
    // and
    expect(movies.listMovies()).toStrictEqual([
      'Batman',
      'Batman Forever',
      'Batman & Robin',
      'Batman Begins',
      'The Dark Knight',
    ]);
  });

  test.each`
    UserType     | LocalDate                      | ShouldSucceed
    ${'basic'}   | ${`2020-02-27T00:00:00-05:00`} | ${false}
    ${'basic'}   | ${`2020-02-28T00:00:00-05:00`} | ${false}
    ${'basic'}   | ${`2020-02-29T23:59:59-05:00`} | ${false}
    ${'basic'}   | ${`2020-03-01T00:00:00-05:00`} | ${true}
    ${'premium'} | ${`2020-02-27T00:00:00-05:00`} | ${true}
    ${'premium'} | ${`2020-02-28T00:00:00-05:00`} | ${true}
    ${'premium'} | ${`2020-02-29T23:59:59-05:00`} | ${true}
    ${'premium'} | ${`2020-03-01T00:00:00-05:00`} | ${true}
  `(
    `a $UserType user tries to create sixth movie at $LocalDate`,
    async ({
      UserType,
      LocalDate,
      ShouldSucceed,
    }: {
      UserType: 'basic' | 'premium';
      LocalDate: string;
      ShouldSucceed: boolean;
    }) => {
      // given
      const movies =
        UserType === 'basic'
          ? fixtures.aBasicUserMovieCollection()
          : fixtures.aPremiumUserMovieCollection();
      // and
      movies.createMovie('Batman');
      movies.createMovie('Batman Returns');
      movies.createMovie('Batman Forever');
      movies.createMovie('Batman & Robin');
      movies.createMovie('Batman Begins');
      // and
      jest.setSystemTime(new Date(LocalDate));
      // when
      const result = movies.createMovie('The Dark Knight');
      // then
      expect(isRight(result)).toBe(ShouldSucceed);
      // and
      expect(movies.listMovies()).toStrictEqual([
        'Batman',
        'Batman Returns',
        'Batman Forever',
        'Batman & Robin',
        'Batman Begins',
        ...(ShouldSucceed ? ['The Dark Knight'] : []),
      ]);
    },
  );
});

export async function getFixtures() {
  const testingModule = await Test.createTestingModule({
    imports: [MoviesDomainModule],
  }).compile();

  const movieCollectionFactory = testingModule.get(MovieCollectionFactory);

  return {
    aBasicUserMovieCollection: () =>
      movieCollectionFactory.createMovieCollection(
        'basic',
        'America/New_York',
        new UserId('basic user'),
      ),
    aPremiumUserMovieCollection: () =>
      movieCollectionFactory.createMovieCollection(
        'premium',
        'America/New_York',
        new UserId('premium'),
      ),
  };
}
