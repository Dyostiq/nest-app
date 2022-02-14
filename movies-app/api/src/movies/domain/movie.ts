import { MovieId } from './movie.id';

export class Movie {
  constructor(
    public readonly movieId: MovieId,
    public readonly title: string,
    public readonly createTime: Date = new Date(),
  ) {}
}
