import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as nock from 'nock';
import * as request from 'supertest';
import { batmanResponses } from '../src/movies/infrastructure/_omdb-details.service.spec/batman.responses';
import { clearRepo } from './clear-repo';

type AuthenticatedUser = string;

export function getFixtures() {
  const fixtures: {
    authenticateUser: () => Promise<AuthenticatedUser>;
    omdbHasBatmanMovies: () => void;
    createAMovie: (user: string, title: string) => Promise<any>;
    createAMovieWithoutAuthentication: () => Promise<any>;
    aUserHasMovies: () => Promise<AuthenticatedUser>;
    otherUserAlsoHasMovies: () => Promise<void>;
    listMovies: (user: AuthenticatedUser) => Promise<any>;
    listMoviesWithoutAuthentication: () => Promise<any>;
  } = {} as any;

  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await clearRepo(app);
    nock.disableNetConnect();
    nock.enableNetConnect(/(localhost|127\.0\.0\.1):/);
  });

  afterEach(async () => {
    await app.close();
    nock.cleanAll();
  });

  fixtures.authenticateUser = async () => {
    const response = await request(`http://localhost:3000`)
      .post(`/auth`)
      .send({
        username: 'basic-thomas',
        password: 'sR-_pcoow-27-6PAwCD8',
      })
      .expect(200);
    return response.body.token;
  };

  fixtures.omdbHasBatmanMovies = async () => {
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
  };

  fixtures.createAMovie = async (user, title: string) => {
    return await request(app.getHttpServer())
      .post('/movies')
      .auth(user, { type: 'bearer' })
      .send({ title });
  };

  fixtures.createAMovieWithoutAuthentication = async () =>
    request(app.getHttpServer())
      .post('/movies')
      .send({ title: 'Batman Returns' });

  fixtures.aUserHasMovies = async () => {
    const user = await fixtures.authenticateUser();
    await fixtures.createAMovie(user, 'Batman');
    await fixtures.createAMovie(user, 'Batman Begins');
    return user;
  };

  fixtures.otherUserAlsoHasMovies = async () => {
    const response = await request(`http://localhost:3000`)
      .post(`/auth`)
      .send({
        username: 'premium-jim',
        password: 'GBLtTyq3E_UNjFnpo9m6',
      })
      .expect(200);
    const user = response.body.token;
    await fixtures.createAMovie(user, 'Batman & Robin');
    await fixtures.createAMovie(user, 'Batman Returns');
  };

  fixtures.listMovies = (user) =>
    request(app.getHttpServer()).get('/movies').auth(user, { type: 'bearer' });
  fixtures.listMoviesWithoutAuthentication = async () =>
    request(app.getHttpServer()).get('/movies');

  return fixtures;
}
