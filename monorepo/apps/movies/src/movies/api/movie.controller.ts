import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { isLeft } from 'fp-ts/Either';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '@app/jwt-auth';
import { CreateMovieService, GetMoviesService } from '../application';
import { CreateMovieDto } from './create-movie.dto';
import { MoviesCollectionDto } from './movies-collection.dto';

@Controller('/movies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MovieController {
  constructor(
    private readonly createMovieService: CreateMovieService,
    private readonly getMoviesService: GetMoviesService,
  ) {}

  @Post()
  async createAMovie(
    @Req() request: Request,
    @Body() body: CreateMovieDto,
  ): Promise<void> {
    const user = request.user;
    if (!user) {
      throw new BadRequestException();
    }

    const result = await this.createMovieService.createMovie(
      body.title,
      user.id.toString(),
      'basic',
    );
    if (isLeft(result)) {
      switch (result.left) {
        case 'duplicate':
        case 'too many movies in a month':
          throw new BadRequestException(result.left);
        case 'service unavailable':
          throw new BadGatewayException(result.left);
        case 'cannot create a movie':
          throw new InternalServerErrorException(result.left);
      }
    }
  }

  @Get()
  async listMovies(@Req() request: Request): Promise<MoviesCollectionDto> {
    const user = request.user;
    if (!user) {
      throw new BadRequestException();
    }

    const result = await this.getMoviesService.getMovies(user.id.toString());
    if (isLeft(result)) {
      throw new InternalServerErrorException();
    }
    return plainToInstance(MoviesCollectionDto, {
      items: result.right,
    });
  }
}
