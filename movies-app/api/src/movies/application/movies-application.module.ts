import { Module, ModuleMetadata } from '@nestjs/common';
import { MoviesDomainModule } from '../domain';
import { CreateMovieService } from './create-movie.service';

@Module({})
export class MoviesApplicationModule {
  static for(adapterModule: ModuleMetadata['imports'] = []) {
    return {
      imports: [...adapterModule, MoviesDomainModule],
      module: MoviesApplicationModule,
      providers: [CreateMovieService],
      exports: [CreateMovieService, ...adapterModule],
    };
  }
}
