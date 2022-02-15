import { TypeormDetailsRepository } from '../../../src/movies/infrastructure/typeorm-details.repository';
import {
  MovieCollectionFactory,
  MovieId,
  UserId,
} from '../../../src/movies/domain';
import { isRight, right } from 'fp-ts/Either';
import {
  DetailsRepository,
  MovieCollectionRepository,
  MovieDetails,
} from '../../../src/movies/application';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { clearRepo } from '../../clear-repo';

let fixtures: Awaited<ReturnType<typeof getFixtures>>;
let typeormDetailsRepository: TypeormDetailsRepository;
beforeEach(async () => {
  fixtures = await getFixtures();
  typeormDetailsRepository = fixtures.getTypeormDetailsRepository();
});

afterEach(async () => {
  await fixtures.cleanup();
});

test(`with multiple details saved should retrieve the correct one`, async () => {
  // given
  const [firstMovieId, secondMovieId, thirdMovieId] =
    await fixtures.aUserHasCollectionWithThreeMovies();
  // and
  const [firstMovie, secondMovie, thirdMovie] = fixtures.sampleDetails();
  // and
  await typeormDetailsRepository.save(firstMovieId, firstMovie);
  await typeormDetailsRepository.save(secondMovieId, secondMovie);
  await typeormDetailsRepository.save(thirdMovieId, thirdMovie);
  // when
  const result = await typeormDetailsRepository.find(secondMovieId);
  // then
  expect(result).toStrictEqual(right(secondMovie));
});

test(`should return null if not found`, async () => {
  // given
  // when
  const result = await typeormDetailsRepository.find(
    new MovieId('not existing'),
  );
  // then
  expect(result).toStrictEqual(right(null));
});

export async function getFixtures() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  await moduleFixture.init();

  await clearRepo(moduleFixture);

  return {
    sampleDetails: () => [
      new MovieDetails(
        'Batman',
        '23 Jun 1989',
        'Action, Adventure',
        'Tim Burton',
      ),
      new MovieDetails(
        'Batman Returns',
        '19 Jun 1992',
        'Action, Crime, Fantasy',
        'Tim Burton',
      ),
      new MovieDetails(
        'Batman Forever',
        '16 Jun 1995',
        'Action, Adventure',
        'Joel Schumacher',
      ),
    ],
    getTypeormDetailsRepository: () => {
      const repo = moduleFixture.get(DetailsRepository);
      if (!(repo instanceof TypeormDetailsRepository)) {
        fail();
      }
      return repo;
    },
    aUserHasCollectionWithThreeMovies: async () => {
      const repo = moduleFixture.get(MovieCollectionRepository);
      const collectionFactory = moduleFixture.get(MovieCollectionFactory);
      const collection = collectionFactory.createMovieCollection(
        'basic',
        'UTC',
        new UserId('123'),
      );
      const movies = ['Batman', 'Batman Begins', 'Batman Returns']
        .map((title) => collection.createMovie(title))
        .filter(isRight)
        .map((result) => result.right);
      await repo.saveCollection(collection);
      if (movies.length !== 3) throw new Error();
      return [movies[0], movies[1], movies[2]];
    },
    cleanup: async () => {
      await moduleFixture.close();
    },
  };
}
