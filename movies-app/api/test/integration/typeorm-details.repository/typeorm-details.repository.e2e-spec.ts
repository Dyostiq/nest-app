import { getFixtures } from './get-fixtures';
import { TypeormDetailsRepository } from '../../../src/movies/infrastructure/typeorm-details.repository';
import { MovieId } from '../../../src/movies/domain';
import { right } from 'fp-ts/Either';

const fixtures = getFixtures();

let typeormDetailsRepository: TypeormDetailsRepository;
beforeEach(() => {
  typeormDetailsRepository = fixtures.getTypeormDetailsRepository();
});

test(`with multiple details saved should retrieve the correct one`, async () => {
  // given
  const [
    firstMovieId,
    secondMovieId,
    thirdMovieId,
  ] = await fixtures.aUserHasCollectionWithThreeMovies();
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
