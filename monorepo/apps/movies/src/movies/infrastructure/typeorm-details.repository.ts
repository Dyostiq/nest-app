import { Injectable } from '@nestjs/common';
import { DetailsRepository, MovieDetails } from '../application';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieId } from '../domain';
import { Either, left, right } from 'fp-ts/Either';
import { DetailsEntity } from './details.entity';

@Injectable()
export class TypeormDetailsRepository extends DetailsRepository {
  constructor(
    @InjectRepository(DetailsEntity)
    private readonly details: Repository<DetailsEntity>,
  ) {
    super();
  }

  async save(
    movieId: MovieId,
    details: MovieDetails,
  ): Promise<Either<Error, MovieId>> {
    try {
      await this.details.save(
        new DetailsEntity(
          movieId.id,
          details.title,
          details.released,
          details.genre,
          details.director,
        ),
      );
    } catch (error) {
      return left(error);
    }
    return right(movieId);
  }

  async find(movieId: MovieId): Promise<Either<Error, MovieDetails | null>> {
    let entity: DetailsEntity | undefined;
    try {
      entity = await this.details.findOne(movieId.id);
    } catch (error) {
      return left(error);
    }
    if (!entity) {
      return right(null);
    }

    return right(
      new MovieDetails(
        entity.title,
        entity.released,
        entity.genre,
        entity.director,
      ),
    );
  }
}
