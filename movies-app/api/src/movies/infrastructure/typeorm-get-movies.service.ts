import { InjectRepository } from '@nestjs/typeorm';
import { MovieCollectionEntity } from './movie-collection.entity';
import { Repository } from 'typeorm';
import { Either, right } from 'fp-ts/Either';
import { GetMoviesError, GetMoviesService, MovieDetails } from '../application';
import { isDefined } from '../../language-extensions/is-defined';

export class TypeormGetMoviesService extends GetMoviesService {
  constructor(
    @InjectRepository(MovieCollectionEntity)
    private readonly collectionRepository: Repository<MovieCollectionEntity>,
  ) {
    super();
  }

  async getMovies(
    userId: string,
  ): Promise<Either<GetMoviesError, MovieDetails[]>> {
    const collection = await this.collectionRepository.findOne(userId, {
      join: {
        alias: 'coll',
        leftJoinAndSelect: {
          movies: 'coll._movies',
          details: 'movies.details',
        },
      },
    });
    if (!collection) {
      return right([]);
    }

    return right(
      collection._movies
        .map((movie) => movie.details)
        .filter(isDefined)
        .map(
          (details) =>
            new MovieDetails(
              details.title,
              details.released,
              details.genre,
              details.director,
            ),
        ),
    );
  }
}
