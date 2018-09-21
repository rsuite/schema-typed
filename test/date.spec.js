import DateType from '../src/DateType';

describe('@DateType', () => {
  describe('#constructor', () => {
    it('should be initialized correctly', done => {
      expect.assertions(9);

      const type = DateType('it should be a date value');

      expect(type.name).toBe('date');
      expect(type.required).toBe(false);
      expect(type.requiredMessage).toBeFalsy();
      expect(type.rules).toHaveLength(1);

      type.check(undefined, undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(null, undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(new Date(), undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a date value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#range', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = DateType('it should be a date value');
      const now = new Date();

      expect(type.rules).toHaveLength(1);

      type.range(
        new Date(now).setDate(now.getDate() - 1),
        new Date(now).setDate(now.getDate() + 1),
        'it should be later than yesterday and earlier than tomorrow'
      );

      expect(type.rules).toHaveLength(2);

      type.check(undefined, undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(null, undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(new Date(), undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(new Date(now).setDate(now.getDate() - 2), undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be later than yesterday and earlier than tomorrow'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a date value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#min', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = DateType('it should be a date value');
      const now = new Date();

      expect(type.rules).toHaveLength(1);

      type.min(new Date(now).setDate(now.getDate() - 1), 'it should be later than yesterday');

      expect(type.rules).toHaveLength(2);

      type.check(undefined, undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(null, undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(new Date(), undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(new Date(now).setDate(now.getDate() - 2), undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be later than yesterday'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a date value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#max', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = DateType('it should be a date value');
      const now = new Date();

      expect(type.rules).toHaveLength(1);

      type.max(new Date(now).setDate(now.getDate() + 1), 'it should be earlier than tomorrow');

      expect(type.rules).toHaveLength(2);

      type.check(undefined, undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(null, undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(new Date(), undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(new Date(now).setDate(now.getDate() + 2), undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be earlier than tomorrow'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a date value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });
});
