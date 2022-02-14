import { MovieCollectionRepository } from './movie-collection.repository';
import {
  CreateAMovieError,
  MovieCollectionFactory,
  UserId,
  MovieId,
} from '../domain';
import { DetailsRepository } from './details.repository';
import { DetailsService } from './details.service';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { Injectable } from '@nestjs/common';

export type CreateMovieApplicationError =
  | 'service unavailable'
  | CreateAMovieError;

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
      return left('service unavailable' as const);
    }

    const detailsSaveResult: Either<
      Error,
      MovieId
    > = await this.detailsRepository.save(
      createMovieResult.right,
      fetchedDetails.right,
    );

    if (isLeft(detailsSaveResult)) {
      await this.rollbackMovieInTransaction(userRole, timezone, userId, title);
      return left('service unavailable');
    }

    return createMovieResult;
  }

  private async createMovieInTransaction(
    userRole: 'basic' | 'premium',
    timezone: string,
    userId: string,
    title: string,
  ) {
    return await this.collections.withTransaction(
      async (transactionalCollections) => {
        const findResult = await transactionalCollections.findUserMovieCollection(
          userRole,
          timezone,
          userId,
        );
        if (isLeft(findResult)) {
          return left('service unavailable' as const);
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
          return left('service unavailable' as const);
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
        return left('service unavailable' as const);
      }
      const collection = findResult.right;
      if (!collection) {
        return left('service unavailable' as const);
      }
      const rollbackResult = await collection.rollbackMovie(title);
      if (isLeft(rollbackResult)) {
        return left('service unavailable' as const);
      }
      const rollbackSaveResult = await transactionalCollections.saveCollection(
        collection,
      );
      if (isLeft(rollbackSaveResult)) {
        return left('service unavailable' as const);
      }
      return right(true);
    });
  }
}
