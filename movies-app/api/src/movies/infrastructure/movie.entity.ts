import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { MovieId, Movie } from '../domain';
import { MovieCollectionEntity } from './movie-collection.entity';
import { JoinColumn } from 'typeorm';
import { DetailsEntity } from './details.entity';

@Entity()
export class MovieEntity implements Movie {
  get movieId(): MovieId {
    return new MovieId(this._movieId);
  }

  set movieId(value: MovieId) {
    this._movieId = value.id;
  }

  @PrimaryColumn()
  _movieId: string;

  @Column()
  title: string;

  @Column()
  createTime: Date;

  @OneToOne(() => DetailsEntity, (details) => details.movie)
  details?: DetailsEntity;

  @ManyToOne(() => MovieCollectionEntity, (collection) => collection._movies)
  @JoinColumn({
    name: 'collectionId',
  })
  collection?: MovieCollectionEntity;

  collectionId: string;

  constructor(
    _movieId: string,
    title: string,
    createTime: Date,
    collectionId: string,
  ) {
    this._movieId = _movieId;
    this.title = title;
    this.createTime = createTime;
    this.collectionId = collectionId;
  }

  static fromMovie(movie: Movie, collectionId: string): MovieEntity {
    return new MovieEntity(
      movie.movieId.id,
      movie.title,
      movie.createTime,
      collectionId,
    );
  }

  toMovie(): Movie {
    return new Movie(this.movieId, this.title, this.createTime);
  }
}
