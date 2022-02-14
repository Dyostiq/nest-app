import { BasicUserPolicy } from './basic-user.policy';
import { PremiumUserPolicy } from './premium-user.policy';
import { MovieCollection, MovieCollectionSnapshot } from './movie-collection';
import { UserId } from './user.id';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MovieCollectionFactory {
  #policies = {
    basic: this.basicUserPolicy,
    premium: this.premiumUserPolicy,
  };

  constructor(
    private readonly basicUserPolicy: BasicUserPolicy,
    private readonly premiumUserPolicy: PremiumUserPolicy,
  ) {}

  createMovieCollection(
    userType: 'basic' | 'premium',
    timezone: string,
    userId: UserId,
    snapshot?: MovieCollectionSnapshot,
  ): MovieCollection {
    if (snapshot) {
      return MovieCollection.fromSnapshot(snapshot, this.#policies[userType]);
    }
    return new MovieCollection(this.#policies[userType], userId, timezone);
  }
}
