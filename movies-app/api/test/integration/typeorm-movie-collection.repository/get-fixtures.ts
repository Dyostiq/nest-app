import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { Connection } from 'typeorm';
import { getConnectionToken } from '@nestjs/typeorm';
import { TypeormMovieCollectionRepository } from '../../../src/movies/infrastructure/typeorm-movie-collection.repository';
import { MovieCollectionFactory } from '../../../src/movies/domain';
import { clearRepo } from '../../clear-repo';
import { MovieCollectionRepository } from '../../../src/movies/application';

export function getFixtures() {
  const fixtures: {
    getTypeormMovieCollectionRepository: () => TypeormMovieCollectionRepository;
    getMovieCollectionFactory: () => MovieCollectionFactory;
  } = {
    getTypeormMovieCollectionRepository: () => {
      throw new Error();
    },
    getMovieCollectionFactory: () => {
      throw new Error();
    },
  };

  let moduleFixture: TestingModule;
  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await clearRepo(moduleFixture);

    fixtures.getTypeormMovieCollectionRepository = () => {
      const repo = moduleFixture.get(MovieCollectionRepository);
      if (!(repo instanceof TypeormMovieCollectionRepository)) {
        fail();
      }
      return repo;
    };
    fixtures.getMovieCollectionFactory = () =>
      moduleFixture.get(MovieCollectionFactory);
    await moduleFixture.init();
  });

  afterEach(async () => {
    await moduleFixture.close();
  });

  return fixtures;
}
