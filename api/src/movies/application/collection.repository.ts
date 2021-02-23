import { Either } from 'fp-ts/Either';
import { MovieCollection } from '../domain';

export abstract class CollectionRepository {
  abstract findUserMovieCollection(
    userType: 'basic' | 'premium',
    timezone: string,
    userId: string,
  ): Promise<Either<Error, MovieCollection | null>>;

  abstract withTransaction<T>(
    transactionCode: (transaction: CollectionRepository) => T,
  ): Promise<T>;

  abstract saveCollection(
    collection: MovieCollection,
  ): Promise<Either<Error, true>>;
}
