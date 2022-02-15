import { right } from 'fp-ts/Either';
import { MovieDetails } from '../../application';
import { assertLeft } from '../../../test/assert-left';
import { OmdbDetailsService } from '../omdb-details.service';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { omdbConfig } from '../omdb.config';
import * as nock from 'nock';
import { batmanResponses } from './batman.responses';

let fixtures: Awaited<ReturnType<typeof getFixtures>>;
let detailsService: OmdbDetailsService;
beforeEach(async () => {
  fixtures = await getFixtures();
  detailsService = fixtures.getOmdbDetailsService();
});

afterEach(async () => {
  await fixtures.cleanup();
});

it(`should retrieve data from omdb`, async () => {
  // given
  fixtures.aOmdbWithBatmanMovies();
  // when
  const details = await detailsService.fetchDetails('Batman Begins');
  // then
  expect(details).toStrictEqual(
    right(
      new MovieDetails(
        'Batman Begins',
        '15 Jun 2005',
        'Action, Adventure',
        'Christopher Nolan',
      ),
    ),
  );
});

it(`should return an error if not found`, async () => {
  // given
  fixtures.aOmdbWithBatmanMovies();
  // when
  const details = await detailsService.fetchDetails('Robin Hood');
  // then
  assertLeft(details);
});

it(`should return an error if not authorized`, async () => {
  // given
  fixtures.aOmdbWithBatmanMovies();
  // and
  fixtures.invalidTestApiKey();
  // when
  const details = await detailsService.fetchDetails('Batman');
  // then
  assertLeft(details);
});

export async function getFixtures() {
  process.env.OMDB_API_KEY = 'validTestApiKey';
  const testingModule = await Test.createTestingModule({
    imports: [
      HttpModule,
      ConfigModule.forRoot({
        load: [omdbConfig],
      }),
    ],
    providers: [OmdbDetailsService],
  }).compile();
  nock.disableNetConnect();

  return {
    getOmdbDetailsService: () => testingModule.get(OmdbDetailsService),
    aOmdbWithBatmanMovies: () => {
      nock('https://www.omdbapi.com')
        .get('/')
        .query({ t: 'Batman', apikey: 'validTestApiKey' })
        .reply(200, batmanResponses['Batman'])
        .get('/')
        .query({ t: 'Batman Returns', apikey: 'validTestApiKey' })
        .reply(200, batmanResponses['Batman Returns'])
        .get('/')
        .query({ t: 'Batman Forever', apikey: 'validTestApiKey' })
        .reply(200, batmanResponses['Batman Forever'])
        .get('/')
        .query({ t: 'Batman & Robin', apikey: 'validTestApiKey' })
        .reply(200, batmanResponses['Batman & Robin'])
        .get('/')
        .query({ t: 'Batman Begins', apikey: 'validTestApiKey' })
        .reply(200, batmanResponses['Batman Begins'])
        .get('/')
        .query({ t: 'The Dark Knight', apikey: 'validTestApiKey' })
        .reply(200, batmanResponses['The Dark Knight'])
        .get('/')
        .query({ apikey: 'validTestApiKey' })
        .reply(200, { Response: 'False', Error: 'Movie not found!' })
        .get('/')
        .reply(401, { Response: 'False', Error: 'Invalid API key!' });
    },
    invalidTestApiKey: () => {
      nock.cleanAll();
      nock('https://www.omdbapi.com')
        .get('/')
        .reply(401, { Response: 'False', Error: 'Invalid API key!' });
    },
    cleanup: () => {
      nock.cleanAll();
      process.env.OMDB_API_KEY = undefined;
    },
  };
}
