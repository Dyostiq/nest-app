import { right } from 'fp-ts/Either';
import { MovieDetails } from '../../application';
import { assertLeft } from '../../../test/assert-left';
import { OmdbDetailsService } from '../omdb-details.service';
import { getFixtures } from './get-fixtures';

const fixtures = getFixtures();
let detailsService: OmdbDetailsService;
beforeEach(() => {
  detailsService = fixtures.getOmdbDetailsService();
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
