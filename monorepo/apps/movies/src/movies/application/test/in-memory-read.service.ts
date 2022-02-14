import { InMemoryCollectionRepository } from './in-memory-collection.repository';
import { InMemoryDetailsRepository } from './in-memory-details.repository';
import { Injectable } from '@nestjs/common';

type DetailedMovie = {
  id: string;
  title: string;
  released?: string;
  genre?: string;
  director?: string;
};

@Injectable()
export class InMemoryReadService {
  constructor(
    private readonly collections: InMemoryCollectionRepository,
    private readonly details: InMemoryDetailsRepository,
  ) {}

  getMovies(userId: string): DetailedMovie[] {
    const collectionSnapshot = this.collections.db[userId];
    if (!collectionSnapshot) {
      return [];
    }
    return collectionSnapshot.movies.reduce((previousValue, currentValue) => {
      const detailsForMovie = this.details.db[currentValue.movieId.id];
      return [
        ...previousValue,
        {
          id: currentValue.movieId.id,
          title: currentValue.title,
          ...detailsForMovie,
        },
      ];
    }, [] as DetailedMovie[]);
  }
}
