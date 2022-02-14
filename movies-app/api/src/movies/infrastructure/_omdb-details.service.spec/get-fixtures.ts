import { OmdbDetailsService } from '../omdb-details.service';
import { Test } from '@nestjs/testing';
import * as nock from 'nock';
import { batmanResponses } from './batman.responses';
import { HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { omdbConfig } from '../omdb.config';

export function getFixtures() {
  const fixtures: {
    aOmdbWithBatmanMovies: () => void;
    invalidTestApiKey: () => void;
    getOmdbDetailsService: () => OmdbDetailsService;
  } = {
    aOmdbWithBatmanMovies: () => {
      throw new Error();
    },
    invalidTestApiKey: () => {
      throw new Error();
    },
    getOmdbDetailsService: () => {
      throw new Error();
    },
  };

  beforeEach(async () => {
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
    fixtures.getOmdbDetailsService = () =>
      testingModule.get(OmdbDetailsService);
    nock.disableNetConnect();
  });

  fixtures.aOmdbWithBatmanMovies = () => {
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
  };

  fixtures.invalidTestApiKey = () => {
    nock.cleanAll();
    nock('https://www.omdbapi.com')
      .get('/')
      .reply(401, { Response: 'False', Error: 'Invalid API key!' });
  };

  afterEach(() => {
    nock.cleanAll();
    process.env.OMDB_API_KEY = undefined;
  });

  return fixtures;
}
