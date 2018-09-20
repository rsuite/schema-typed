import NumberType from '../src/NumberType';

describe('@NumberType', () => {
  describe('#constructor', () => {
    it('should be initialized correctly', done => {
      expect.assertions(9);

      const type = new NumberType('it should be a number value');

      expect(type.name).toBe('number');
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

      type.check('1,000,000', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a number value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#isInteger', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = new NumberType('it should be a number value');

      expect(type.rules).toHaveLength(1);

      type.isInteger('it should be integer');

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

      type.check('100', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('1,000,000', undefined, result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should be integer' });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a number value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#pattern', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = new NumberType('it should be a number value');

      expect(type.rules).toHaveLength(1);

      type.pattern(/^1,000,000$/, 'it should be one million');

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

      type.check('1,000,000', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('100,000', undefined, result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should be one million' });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a number value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#isOneOf', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = new NumberType('it should be a number value');

      expect(type.rules).toHaveLength(1);

      type.isOneOf([10, 100, 1000], 'it should be one of numbers');

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

      type.check('1000', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('10000', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be one of numbers'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a number value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#range', () => {
    it('should be correct', done => {
      expect.assertions(9);

      const type = new NumberType('it should be a number value');

      expect(type.rules).toHaveLength(1);

      type.range(0, 1000, 'it should be more than 0 and less than 1000');

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

      type.check('0', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('1000', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('10000', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be more than 0 and less than 1000'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a number value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#min', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = new NumberType('it should be a number value');

      expect(type.rules).toHaveLength(1);

      type.min(10000, 'it should be more than 10000');

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

      type.check('10000', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('1000', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be more than 10000'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a number value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#max', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = new NumberType('it should be a number value');

      expect(type.rules).toHaveLength(1);

      type.max(1000, 'it should be less than 1000');

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

      type.check('1000', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('10000', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be less than 1000'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a number value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });
});
