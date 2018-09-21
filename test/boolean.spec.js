import BooleanType from '../src/BooleanType';

describe('@BooleanType', () => {
  describe('#constructor', () => {
    it('should be initialized correctly', done => {
      expect.assertions(10);

      const type = BooleanType('it should be a boolean value');

      expect(type.name).toBe('boolean');
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

      type.check(true, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(false, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([], result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a boolean value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });
});
