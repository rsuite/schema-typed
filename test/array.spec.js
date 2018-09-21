import ArrayType from '../src/ArrayType';
import StringType from '../src/StringType';

describe('@ArrayType', () => {
  describe('#constructor', () => {
    it('should be initialized correctly', done => {
      expect.assertions(9);

      const type = ArrayType('it should be an array value');

      expect(type.name).toBe('array');
      expect(type.required).toBe(false);
      expect(type.requiredMessage).toBeFalsy();
      expect(type.rules).toHaveLength(1);

      type.check(undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(null, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(true, result => {
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

      const type = ArrayType('it should be an array value');

      expect(type.rules).toHaveLength(1);

      type.rangeLength(1, 3, 'it should have more than 1 and less than 3 items');

      expect(type.rules).toHaveLength(2);

      type.check(undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(null, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([1, 2], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([1, 2, 3, 4], result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have more than 1 and less than 3 items'
        });
      });

      type.check(true, result => {
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

      const type = ArrayType('it should be an array value');

      expect(type.rules).toHaveLength(1);

      type.minLength(1, 'it should have more than 1 item');

      expect(type.rules).toHaveLength(2);

      type.check(undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(null, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([1], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([], result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have more than 1 item'
        });
      });

      type.check(true, result => {
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

      const type = ArrayType('it should be an array value');

      expect(type.rules).toHaveLength(1);

      type.maxLength(3, 'it should have less than 3 items');

      expect(type.rules).toHaveLength(2);

      type.check(undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(null, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([1, 2], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([1, 2, 3, 4], result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have less than 3 items'
        });
      });

      type.check(true, result => {
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

      const type = ArrayType('it should be an array value');

      expect(type.rules).toHaveLength(1);

      type.unrepeatable('it should not have repeat item');

      expect(type.rules).toHaveLength(2);

      type.check(undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(null, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([1, 2], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([1, 2, 2, 3], result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should not have repeat item'
        });
      });

      type.check(true, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be an array value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#of', () => {
    it('should be correct', done => {
      expect.assertions(11);

      const type = ArrayType('it should be an array value');
      const str = StringType('it should be an string value');

      expect(type.rules).toHaveLength(1);

      str.isOneOf(['a', 'b', 'c'], 'it should be a correct value');
      type.of(str, 'the item of array should be correct string value');

      expect(type.rules).toHaveLength(2);

      type.check(undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(null, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(['a', 'b', 'c'], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(['b', 'c'], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(['c'], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(['1', 'b', 'c'], result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'the item of array should be correct string value'
        });
      });

      type.check(['a', '2', 'c'], result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'the item of array should be correct string value'
        });
      });

      type.check(['a', 'b', '3'], result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'the item of array should be correct string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });
});
