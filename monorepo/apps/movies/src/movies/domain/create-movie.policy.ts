import { Movie } from './movie';
import { Either } from 'fp-ts/Either';

export abstract class CreateMoviePolicy<Errors = CreateMoviePolicyError> {
  abstract canCreate(movies: Movie[], timezone: string): Either<Errors, true>;
}

export type CreateMoviePolicyError = 'cannot create a movie';
