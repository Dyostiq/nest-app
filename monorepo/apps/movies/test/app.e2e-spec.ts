import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { clearRepo } from './clear-repo';
import * as nock from 'nock';
import * as request from 'supertest';
import { batmanResponses } from '../src/movies/infrastructure/_omdb-details.service.spec/batman.responses';

let fixtures: Awaited<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures.cleanup();
});

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
  expect(creationResult.status).toBe(502);
  // and
  expect(creationResult.body).toStrictEqual({
    error: 'Bad Gateway',
    statusCode: 502,
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

export async function getFixtures() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  await clearRepo(app);
  nock.disableNetConnect();
  nock.enableNetConnect(/(localhost|127\.0\.0\.1):/);

  const userUniqueSuffix = Math.floor(Math.random() * 1_000_000);
  return {
    cleanup: async () => {
      await app.close();
      nock.cleanAll();
    },

    authenticateUser: async () => {
      await request(`http://localhost:3000`)
        .post(`/signup`)
        .send({
          email: `basic-thomas${userUniqueSuffix}@example.com`,
          password: 'sR-_pcoow-27-6PAwCD8',
        })
        .expect(201);

      const response = await request(`http://localhost:3000`)
        .post(`/signin`)
        .send({
          email: `basic-thomas${userUniqueSuffix}@example.com`,
          password: 'sR-_pcoow-27-6PAwCD8',
        })
        .expect(200);
      return response.body.accessToken;
    },

    omdbHasBatmanMovies: async () => {
      nock('https://www.omdbapi.com')
        .get('/')
        .query({ t: 'Batman', apikey: process.env.OMDB_API_KEY })
        .reply(200, batmanResponses['Batman'])
        .get('/')
        .query({ t: 'Batman Returns', apikey: process.env.OMDB_API_KEY })
        .reply(200, batmanResponses['Batman Returns'])
        .get('/')
        .query({ t: 'Batman Forever', apikey: process.env.OMDB_API_KEY })
        .reply(200, batmanResponses['Batman Forever'])
        .get('/')
        .query({ t: 'Batman & Robin', apikey: process.env.OMDB_API_KEY })
        .reply(200, batmanResponses['Batman & Robin'])
        .get('/')
        .query({ t: 'Batman Begins', apikey: process.env.OMDB_API_KEY })
        .reply(200, batmanResponses['Batman Begins'])
        .get('/')
        .query({ t: 'The Dark Knight', apikey: process.env.OMDB_API_KEY })
        .reply(200, batmanResponses['The Dark Knight'])
        .get('/')
        .query({ apikey: process.env.OMDB_API_KEY })
        .reply(200, { Response: 'False', Error: 'Movie not found!' })
        .get('/')
        .reply(401, { Response: 'False', Error: 'Invalid API key!' });
    },

    createAMovie: async (user, title: string) => {
      return await request(app.getHttpServer())
        .post('/movies')
        .auth(user, { type: 'bearer' })
        .send({ title });
    },

    createAMovieWithoutAuthentication: async () =>
      request(app.getHttpServer())
        .post('/movies')
        .send({ title: 'Batman Returns' }),

    async aUserHasMovies() {
      const user = await this.authenticateUser();
      await this.createAMovie(user, 'Batman');
      await this.createAMovie(user, 'Batman Begins');
      return user;
    },

    async otherUserAlsoHasMovies() {
      await request(`http://localhost:3000`)
        .post(`/signup`)
        .send({
          email: `premium-jim${userUniqueSuffix}@example.com`,
          password: 'GBLtTyq3E_UNjFnpo9m6',
        })
        .expect(201);
      const response = await request(`http://localhost:3000`)
        .post(`/signin`)
        .send({
          email: `premium-jim${userUniqueSuffix}@example.com`,
          password: 'GBLtTyq3E_UNjFnpo9m6',
        })
        .expect(200);
      const user = response.body.accessToken;
      await fixtures.createAMovie(user, 'Batman & Robin');
      await fixtures.createAMovie(user, 'Batman Returns');
    },

    listMovies: (user) =>
      request(app.getHttpServer())
        .get('/movies')
        .auth(user, { type: 'bearer' }),
    listMoviesWithoutAuthentication: async () =>
      request(app.getHttpServer()).get('/movies'),
  };
}
