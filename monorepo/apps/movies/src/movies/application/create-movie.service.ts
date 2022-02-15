import { MovieCollectionRepository } from './movie-collection.repository';
import { MovieCollectionFactory, UserId, MovieId } from '../domain';
import { DetailsRepository } from './details.repository';
import { DetailsService } from './details.service';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { Injectable } from '@nestjs/common';

import {
  duplicateError,
  tooManyMoviesInAMonthError,
  cannotCreateAMovieError,
} from '../domain';

export { duplicateError, tooManyMoviesInAMonthError, cannotCreateAMovieError };

export const serviceUnavailableError = Symbol('service unavailable');
export type CreateMovieApplicationError =
  | typeof serviceUnavailableError
  | typeof duplicateError
  | typeof tooManyMoviesInAMonthError
  | typeof cannotCreateAMovieError;

@Injectable()
export class CreateMovieService {
  constructor(
    private readonly collections: MovieCollectionRepository,
    private readonly collectionFactory: MovieCollectionFactory,
    private readonly detailsRepository: DetailsRepository,
    private readonly detailsService: DetailsService,
  ) {}

  async createMovie(
    title: string,
    userId: string,
    userRole: 'basic' | 'premium',
  ): Promise<Either<CreateMovieApplicationError, MovieId>> {
    const timezone = 'UTC';

    const createMovieResult = await this.createMovieInTransaction(
      userRole,
      timezone,
      userId,
      title,
    );

    if (isLeft(createMovieResult)) {
      return createMovieResult;
    }

    const fetchedDetails = await this.detailsService.fetchDetails(title);

    if (isLeft(fetchedDetails)) {
      await this.rollbackMovieInTransaction(userRole, timezone, userId, title);
      return left(serviceUnavailableError);
    }

    const detailsSaveResult: Either<Error, MovieId> =
      await this.detailsRepository.save(
        createMovieResult.right,
        fetchedDetails.right,
      );

    if (isLeft(detailsSaveResult)) {
      await this.rollbackMovieInTransaction(userRole, timezone, userId, title);
      return left(serviceUnavailableError);
    }

    return createMovieResult;
  }

  private async createMovieInTransaction(
    userRole: 'basic' | 'premium',
    timezone: string,
    userId: string,
    title: string,
  ): Promise<Either<CreateMovieApplicationError, MovieId>> {
    return await this.collections.withTransaction(
      async (transactionalCollections) => {
        const findResult =
          await transactionalCollections.findUserMovieCollection(
            userRole,
            timezone,
            userId,
          );
        if (isLeft(findResult)) {
          return left(serviceUnavailableError);
        }

        const collection =
          findResult.right ??
          this.collectionFactory.createMovieCollection(
            userRole,
            'UTC',
            new UserId(userId),
          );

        const movieCreationResult = collection.createMovie(title);
        if (isLeft(movieCreationResult)) {
          return movieCreationResult;
        }

        const saveResult = await transactionalCollections.saveCollection(
          collection,
        );
        if (isLeft(saveResult)) {
          return left(serviceUnavailableError);
        }
        return movieCreationResult;
      },
    );
  }

  private async rollbackMovieInTransaction(
    userRole: 'basic' | 'premium',
    timezone: string,
    userId: string,
    title: string,
  ) {
    await this.collections.withTransaction(async (transactionalCollections) => {
      const findResult = await transactionalCollections.findUserMovieCollection(
        userRole,
        timezone,
        userId,
      );

      if (isLeft(findResult)) {
        return left(serviceUnavailableError);
      }
      const collection = findResult.right;
      if (!collection) {
        return left(serviceUnavailableError);
      }
      const rollbackResult = await collection.rollbackMovie(title);
      if (isLeft(rollbackResult)) {
        return left(serviceUnavailableError);
      }
      const rollbackSaveResult = await transactionalCollections.saveCollection(
        collection,
      );
      if (isLeft(rollbackSaveResult)) {
        return left(serviceUnavailableError);
      }
      return right(true);
    });
  }
}
