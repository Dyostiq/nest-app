import { DetailsRepository } from '../details.repository';
import { Optional } from 'utility-types';
import { MovieDetails } from '../movie-details';
import { MovieId } from '../../domain';
import { Either, right } from 'fp-ts/Either';
import { classToClass } from 'class-transformer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryDetailsRepository extends DetailsRepository {
  db: Optional<{
    [id: string]: MovieDetails;
  }> = {};

  async save(
    movieId: MovieId,
    details: MovieDetails,
  ): Promise<Either<Error, MovieId>> {
    this.db[movieId.id] = classToClass(details);
    return right(movieId);
  }
}
