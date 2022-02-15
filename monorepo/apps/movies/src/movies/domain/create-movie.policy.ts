import { Movie } from './movie';
import { Either } from 'fp-ts/Either';

export abstract class CreateMoviePolicy<Errors = CreateMoviePolicyError> {
  abstract canCreate(movies: Movie[], timezone: string): Either<Errors, true>;
}

export const cannotCreateAMovieError = Symbol('cannot create a movie');
export type CreateMoviePolicyError = typeof cannotCreateAMovieError;
