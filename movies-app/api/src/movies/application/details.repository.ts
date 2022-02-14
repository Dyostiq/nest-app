import { MovieId } from '../domain';
import { MovieDetails } from './movie-details';
import { Either } from 'fp-ts/Either';

export abstract class DetailsRepository {
  abstract save(
    movieId: MovieId,
    details: MovieDetails,
  ): Promise<Either<Error, MovieId>>;
}
