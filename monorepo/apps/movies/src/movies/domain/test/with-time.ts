export function withTime(datetime: string, tests: () => void) {
  describe(`with ${datetime} date`, () => {
    beforeEach(() => {
      jest.useFakeTimers('modern').setSystemTime(new Date(datetime));
    });

    tests();

    afterEach(() => {
      jest.useRealTimers();
    });
  });
}
