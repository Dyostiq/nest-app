import { Either, isRight, Right } from 'fp-ts/Either';

export function assertRight<E, A>(
  either: Either<E, A>,
): asserts either is Right<A> {
  expect(isRight(either)).toBe(true);
}
