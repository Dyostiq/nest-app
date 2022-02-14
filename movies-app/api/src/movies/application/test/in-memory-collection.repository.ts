import { MovieCollectionRepository } from '..';
import { Optional } from 'utility-types';
import {
  MovieCollection,
  MovieCollectionFactory,
  MovieCollectionSnapshot,
  UserId,
} from '../../domain';
import { Either, right } from 'fp-ts/Either';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryCollectionRepository extends MovieCollectionRepository {
  db: Optional<{
    [id: string]: MovieCollectionSnapshot;
  }> = {};

  constructor(private readonly movieCollectionFactory: MovieCollectionFactory) {
    super();
  }

  async findUserMovieCollection(
    userType: 'basic' | 'premium',
    timezone: string,
    userId: string,
  ): Promise<Either<Error, MovieCollection | null>> {
    const movieCollectionSnapshot = this.db[userId];
    if (!movieCollectionSnapshot) {
      return right(null);
    }
    return right(
      this.movieCollectionFactory.createMovieCollection(
        userType,
        timezone,
        new UserId(userId),
        movieCollectionSnapshot,
      ),
    );
  }

  async saveCollection(
    collection: MovieCollection,
  ): Promise<Either<Error, true>> {
    const snapshot = collection.toSnapshot();
    this.db[snapshot.userId.id] = snapshot;
    return right(true);
  }

  async withTransaction<T>(
    transactionCode: (transaction: MovieCollectionRepository) => T,
  ): Promise<T> {
    return transactionCode(this);
  }
}
