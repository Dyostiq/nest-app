// out ports
export { MovieCollectionRepository } from './movie-collection.repository';
export { DetailsService } from './details.service';
export { DetailsRepository } from './details.repository';
export { UserStatusRepository } from './user-status.repository';

// in ports
export { GetMoviesService, GetMoviesError } from './get-movies.service';
export {
  CreateMovieService,
  serviceUnavailableError,
  duplicateError,
  tooManyMoviesInAMonthError,
  cannotCreateAMovieError,
} from './create-movie.service';

// data
export { MovieDetails } from './movie-details';

// module
export { MoviesApplicationModule } from './movies-application.module';
