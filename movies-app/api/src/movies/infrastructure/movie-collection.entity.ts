import { Movie, MovieCollectionSnapshot, UserId } from '../domain';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { MovieEntity } from './movie.entity';

@Entity()
export class MovieCollectionEntity implements MovieCollectionSnapshot {
  get movies(): Movie[] {
    if (!this._movies) {
      throw new Error();
    }
    return this._movies.map((movie) => movie.toMovie());
  }

  set movies(value: Movie[]) {
    this._movies = value.map((movie) =>
      MovieEntity.fromMovie(movie, this._userId),
    );
  }
  get userId(): UserId {
    return new UserId(this._userId);
  }

  set userId(value: UserId) {
    this._userId = value.id;
  }

  @OneToMany(() => MovieEntity, (movie) => movie.collection, {
    eager: true,
    cascade: true,
  })
  _movies: MovieEntity[];

  @Column()
  timezone: string;

  @PrimaryColumn()
  _userId: string;

  constructor(_movies: MovieEntity[], timezone: string, _userId: string) {
    this._movies = _movies;
    this.timezone = timezone;
    this._userId = _userId;
  }
}
