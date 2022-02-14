import {
  CreateMoviePolicy,
  CreateMoviePolicyError,
} from './create-movie.policy';
import { Either, right } from 'fp-ts/Either';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PremiumUserPolicy extends CreateMoviePolicy {
  canCreate(): Either<CreateMoviePolicyError, true> {
    return right(true);
  }
}
