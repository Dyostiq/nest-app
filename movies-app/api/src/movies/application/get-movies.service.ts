import { Either } from 'fp-ts/Either';
import { MovieDetails } from './movie-details';

export type GetMoviesError = 'error';

export abstract class GetMoviesService {
  abstract getMovies(
    userId: string,
  ): Promise<Either<GetMoviesError, MovieDetails[]>>;
}
