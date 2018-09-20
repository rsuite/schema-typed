import BooleanType from '../src/BooleanType';

describe('@BooleanType', () => {
  describe('#constructor', () => {
    it('should be initialized correctly', done => {
      const type = new BooleanType('it should be a boolean value');

      expect(type.name).toBe('boolean');
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

      type.check(true, undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(false, undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a boolean value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });
});
