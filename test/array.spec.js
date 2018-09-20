import ArrayType from '../src/ArrayType';

describe('@ArrayType', () => {
  describe('#constructor', () => {
    it('should be initialized correctly', done => {
      expect.assertions(9);

      const type = new ArrayType('it should be an array value');

      expect(type.name).toBe('array');
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

      type.check([], undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(true, undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be an array value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#rangeLength', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = new ArrayType('it should be an array value');

      expect(type.rules).toHaveLength(1);

      type.rangeLength(1, 3, 'it should have more than 1 and less than 3 items');

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

      type.check([1, 2], undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([1, 2, 3, 4], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have more than 1 and less than 3 items'
        });
      });

      type.check(true, undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be an array value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#minLength', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = new ArrayType('it should be an array value');

      expect(type.rules).toHaveLength(1);

      type.minLength(1, 'it should have more than 1 item');

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

      type.check([1], undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have more than 1 item'
        });
      });

      type.check(true, undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be an array value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#maxLength', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = new ArrayType('it should be an array value');

      expect(type.rules).toHaveLength(1);

      type.maxLength(3, 'it should have less than 3 items');

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

      type.check([1, 2], undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([1, 2, 3, 4], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have less than 3 items'
        });
      });

      type.check(true, undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be an array value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#unrepeatable', () => {
    it('should be correct', done => {
      expect.assertions(8);

      const type = new ArrayType('it should be an array value');

      expect(type.rules).toHaveLength(1);

      type.unrepeatable('it should not have repeat item');

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

      type.check([1, 2], undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([1, 2, 2, 3], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should not have repeat item'
        });
      });

      type.check(true, undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be an array value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });
});
