import { TypeormMovieCollectionRepository } from '../../../src/movies/infrastructure/typeorm-movie-collection.repository';
import {
  MovieCollection,
  MovieCollectionFactory,
  UserId,
} from '../../../src/movies/domain';
import { assertRight } from '../../../src/test/assert-right';
import { getFixtures } from './get-fixtures';
import { right } from 'fp-ts/Either';

let typeormMovieCollectionRepository: TypeormMovieCollectionRepository,
  movieCollectionFactory: MovieCollectionFactory;
const fixtures = getFixtures();
beforeEach(async () => {
  typeormMovieCollectionRepository = fixtures.getTypeormMovieCollectionRepository();
  movieCollectionFactory = fixtures.getMovieCollectionFactory();
});

test(`should be able to retrieve saved entity`, async () => {
  // given
  const movieCollectionUserAtka = movieCollectionFactory.createMovieCollection(
    'premium',
    'America/Atka',
    new UserId('atka user'),
  );
  movieCollectionUserAtka.createMovie('Batman');
  movieCollectionUserAtka.createMovie('Batman Returns');
  // and
  const movieCollectionUserAruba = movieCollectionFactory.createMovieCollection(
    'premium',
    'America/Aruba',
    new UserId('aruba user'),
  );
  movieCollectionUserAruba.createMovie('Batman Begins');
  movieCollectionUserAruba.createMovie('The Dark Knight');
  // and
  const movieCollectionUserDominica = movieCollectionFactory.createMovieCollection(
    'premium',
    'America/Dominica',
    new UserId('dominica user'),
  );
  movieCollectionUserDominica.createMovie('Batman Begins');
  movieCollectionUserDominica.createMovie('Batman & Robin');
  // and
  await typeormMovieCollectionRepository.withTransaction(async (repo) => {
    await repo.saveCollection(movieCollectionUserAtka);
    await repo.saveCollection(movieCollectionUserAruba);
    await repo.saveCollection(movieCollectionUserDominica);
  });
  // when
  const arubaRetrievedCollection = await typeormMovieCollectionRepository.findUserMovieCollection(
    'premium',
    'America/Aruba',
    'aruba user',
  );
  // then
  assertRight(arubaRetrievedCollection);
  // and
  expect(movieCollectionUserAruba).toStrictEqual(
    arubaRetrievedCollection.right,
  );
});

test(`should update entities`, async () => {
  // given
  const movieCollectionUserAtka = movieCollectionFactory.createMovieCollection(
    'premium',
    'America/Atka',
    new UserId('atka user'),
  );
  movieCollectionUserAtka.createMovie('Batman');
  movieCollectionUserAtka.createMovie('Batman Returns');
  // and
  await typeormMovieCollectionRepository.saveCollection(
    movieCollectionUserAtka,
  );
  // when
  const updatedMovieCollection: MovieCollection = await typeormMovieCollectionRepository.withTransaction(
    async (repo) => {
      const foundCollectionResult = await repo.findUserMovieCollection(
        'premium',
        'America/Atka',
        'atka user',
      );
      assertRight(foundCollectionResult);
      const { right: foundCollection } = foundCollectionResult;
      if (!foundCollection) {
        fail();
      }
      foundCollection.createMovie('Batman Begins');
      await repo.saveCollection(foundCollection);
      return foundCollection;
    },
  );
  // then
  expect(
    await typeormMovieCollectionRepository.findUserMovieCollection(
      'premium',
      'America/Atka',
      'atka user',
    ),
  ).toStrictEqual(right(updatedMovieCollection));
});
