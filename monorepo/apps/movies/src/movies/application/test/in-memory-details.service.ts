import { DetailsService } from '../details.service';
import { Either, left, right } from 'fp-ts/Either';
import { MovieDetails } from '../movie-details';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryDetailsService extends DetailsService {
  db = [
    {
      title: 'Batman',
      released: '23 Jun 1989',
      genre: 'Action, Adventure',
      director: 'Tim Burton',
    },
    {
      title: 'Batman Returns',
      released: '19 Jun 1992',
      genre: 'Action, Crime, Fantasy',
      director: 'Tim Burton',
    },
    {
      title: 'Batman Forever',
      released: '16 Jun 1995',
      genre: 'Action, Adventure',
      director: 'Joel Schumacher',
    },
    {
      title: 'Batman & Robin',
      released: '20 Jun 1997',
      genre: 'Action, Sci-Fi',
      director: 'Joel Schumacher',
    },
    {
      title: 'Batman Begins',
      released: '15 Jun 2005',
      genre: 'Action, Adventure',
      director: 'Christopher Nolan',
    },
    {
      title: 'The Dark Knight',
      released: '18 Jul 2008',
      genre: 'Action, Crime, Drama, Thriller',
      director: 'Christopher Nolan',
    },
  ];

  async fetchDetails(title: string): Promise<Either<Error, MovieDetails>> {
    const movie = this.db.find((movie) => movie.title === title);
    if (!movie) {
      return left(new Error('not found'));
    }
    return right(movie);
  }
}
