import { MovieCollectionRepository } from '../application';
import { MovieCollection, MovieCollectionFactory, UserId } from '../domain';
import { Either, left, right } from 'fp-ts/Either';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { MovieCollectionEntity } from './movie-collection.entity';
import { MovieEntity } from './movie.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TypeormMovieCollectionRepository extends MovieCollectionRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly movieCollectionFactory: MovieCollectionFactory,
  ) {
    super();
  }

  async findUserMovieCollection(
    userType: 'basic' | 'premium',
    timezone: string,
    userId: string,
  ): Promise<Either<Error, MovieCollection | null>> {
    let snapshot: MovieCollectionEntity | undefined;
    try {
      snapshot = await this.entityManager.findOne(
        MovieCollectionEntity,
        userId,
      );
    } catch (error) {
      left(error);
    }

    if (!snapshot) {
      return right(null);
    }

    return right(
      this.movieCollectionFactory.createMovieCollection(
        userType,
        timezone,
        new UserId(userId),
        snapshot,
      ),
    );
  }

  async saveCollection(
    collection: MovieCollection,
  ): Promise<Either<Error, true>> {
    const snapshot = collection.toSnapshot();
    const snapshotEntity = new MovieCollectionEntity(
      snapshot.movies.map((movie) =>
        MovieEntity.fromMovie(movie, snapshot.userId.id),
      ),
      snapshot.timezone,
      snapshot.userId.id,
    );
    try {
      await this.entityManager.save(snapshotEntity);
    } catch (error) {
      return left(error);
    }
    return right(true);
  }

  async withTransaction<T>(
    transactionCode: (transaction: MovieCollectionRepository) => T,
  ): Promise<T> {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const repositoryCopy = new TypeormMovieCollectionRepository(
          transactionalEntityManager,
          this.movieCollectionFactory,
        );
        return await transactionCode(repositoryCopy);
      },
    );
  }
}
