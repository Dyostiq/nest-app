import * as uuid from 'uuid';

export class MovieId {
  constructor(public readonly id: string) {}

  static newOne(): MovieId {
    return new MovieId(uuid.v4());
  }
}
