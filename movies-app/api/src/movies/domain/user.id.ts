import { MovieId } from './movie.id';
import * as uuid from 'uuid';

export class UserId {
  constructor(public readonly id: string) {}

  static newOne(): MovieId {
    return new MovieId(uuid.v4());
  }
}
