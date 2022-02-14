import { Either, isLeft, Left } from 'fp-ts/Either';

export function assertLeft<E, A>(
  either: Either<E, A>,
): asserts either is Left<E> {
  expect(isLeft(either)).toBe(true);
}
