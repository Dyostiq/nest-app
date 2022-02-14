import { Either } from 'fp-ts/Either';
import { MovieDetails } from './movie-details';

export abstract class DetailsService {
  abstract fetchDetails(title: string): Promise<Either<Error, MovieDetails>>;
}
