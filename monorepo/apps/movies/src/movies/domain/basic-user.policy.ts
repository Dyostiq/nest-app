import * as luxon from 'luxon';
import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { CreateMoviePolicy } from './create-movie.policy';
import { Movie } from './movie';

export const tooManyMoviesInAMonthError = Symbol('too many movies in a month');
export type BasicUserPolicyError = typeof tooManyMoviesInAMonthError;

@Injectable()
export class BasicUserPolicy extends CreateMoviePolicy<BasicUserPolicyError> {
  canCreate(
    movies: Movie[],
    timezone: string,
  ): Either<BasicUserPolicyError, true> {
    if (this.numberOfMoviesThisMonth(movies, timezone) >= 5) {
      return left(tooManyMoviesInAMonthError);
    }
    return right(true);
  }

  private numberOfMoviesThisMonth(movies: Movie[], timezone: string) {
    return movies.reduce((numberOfMoviesThisMonth, movie) => {
      const isInCurrentMonth = luxon.DateTime.now()
        .setZone(timezone)
        .hasSame(luxon.DateTime.fromJSDate(movie.createTime), 'month');

      if (isInCurrentMonth) {
        return numberOfMoviesThisMonth + 1;
      } else {
        return numberOfMoviesThisMonth;
      }
    }, 0);
  }
}
