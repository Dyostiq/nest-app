import { getFixtures } from './get-fixtures';

const fixtures = getFixtures();

test(`an invalid request should be rejected`, async () => {
  // given
  const authenticatedUser = await fixtures.authenticateUser();
  // and
  await fixtures.omdbHasBatmanMovies();
  // when
  const creationResult = await fixtures.createAMovie(authenticatedUser, '');
  // then
  expect(creationResult.status).toBe(400);
  // and
  expect(creationResult.body).toStrictEqual({
    error: 'Bad Request',
    message: ['title should not be empty'],
    statusCode: 400,
  });
  // and
  expect((await fixtures.listMovies(authenticatedUser)).body).toStrictEqual({
    items: [],
  });
});

test(`an not known movie should fail`, async () => {
  // given
  const authenticatedUser = await fixtures.authenticateUser();
  // and
  await fixtures.omdbHasBatmanMovies();
  // when
  const creationResult = await fixtures.createAMovie(
    authenticatedUser,
    'Robin Hood',
  );
  // then
  expect(creationResult.status).toBe(500);
  // and
  expect(creationResult.body).toStrictEqual({
    message: 'Internal Server Error',
    statusCode: 500,
  });
  // and
  expect((await fixtures.listMovies(authenticatedUser)).body).toStrictEqual({
    items: [],
  });
});

test(`an authenticated user should be able to create a movie`, async () => {
  // given
  const authenticatedUser = await fixtures.authenticateUser();
  // and
  await fixtures.omdbHasBatmanMovies();
  // when
  const creationResult = await fixtures.createAMovie(
    authenticatedUser,
    'Batman',
  );
  // then
  expect(creationResult.status).toBe(201);
  // and
  expect(creationResult.body).toStrictEqual({});
});

test(`a not authenticated user can not create movies`, async () => {
  // given
  await fixtures.omdbHasBatmanMovies();
  // when
  const creationResult = await fixtures.createAMovieWithoutAuthentication();
  // then
  expect(creationResult.status).toBe(401);
  // and
  expect(creationResult.body).toStrictEqual({
    message: 'Unauthorized',
    statusCode: 401,
  });
});

test(`an authenticated user should be able to list movies`, async () => {
  // given
  fixtures.omdbHasBatmanMovies();
  // and
  const user = await fixtures.aUserHasMovies();
  // and
  await fixtures.otherUserAlsoHasMovies();
  // when
  const list = await fixtures.listMovies(user);
  // then
  expect(list.body).toStrictEqual({
    items: [
      {
        title: 'Batman',
        released: '23 Jun 1989',
        genre: 'Action, Adventure',
        director: 'Tim Burton',
      },
      {
        title: 'Batman Begins',
        released: '15 Jun 2005',
        genre: 'Action, Adventure',
        director: 'Christopher Nolan',
      },
    ],
  });
});

test(`a not authenticated user can not list movies`, async () => {
  // given
  await fixtures.omdbHasBatmanMovies();
  // when
  const list = await fixtures.listMoviesWithoutAuthentication();
  // then
  expect(list.status).toBe(401);
  // and
  expect(list.body).toStrictEqual({
    message: 'Unauthorized',
    statusCode: 401,
  });
});
