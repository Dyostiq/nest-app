import { DetailsService, MovieDetails } from '../application';
import { Either, left, right } from 'fp-ts/Either';
import { HttpService, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { omdbConfig } from './omdb.config';
import { IsString, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

class OmdbDetailsDto {
  @IsString()
  Title!: string;

  @IsString()
  Released!: string;

  @IsString()
  Genre!: string;

  @IsString()
  Director!: string;
}

@Injectable()
export class OmdbDetailsService implements DetailsService {
  constructor(
    private readonly http: HttpService,
    @Inject(omdbConfig.KEY)
    private readonly config: ConfigType<typeof omdbConfig>,
  ) {}

  async fetchDetails(title: string): Promise<Either<Error, MovieDetails>> {
    let response;
    try {
      response = await this.http
        .get('https://www.omdbapi.com', {
          params: {
            t: title,
            apikey: this.config.apikey,
          },
        })
        .toPromise();
    } catch (error) {
      return left(error);
    }

    if (response.data?.Response !== 'True') {
      return left(new Error('response failed'));
    }

    const dto = plainToClass(OmdbDetailsDto, response.data);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return left(new Error('response invalid'));
    }

    return right(
      new MovieDetails(dto.Title, dto.Released, dto.Genre, dto.Director),
    );
  }
}
