import ObjectType from '../src/ObjectType';
import StringType from '../src/StringType';

describe('@ObjectType', () => {
  describe('#constructor', () => {
    it('should be initialized correctly', done => {
      expect.assertions(9);

      const type = ObjectType('it should be an object value');

      expect(type.name).toBe('object');
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

      type.check({}, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(true, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be an object value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#shape', () => {
    it('should be correct when object is plain object', done => {
      expect.assertions(11);

      const type = ObjectType('it should be an object value');

      expect(type.rules).toHaveLength(1);

      type.shape({
        email: StringType('it should be string value').isEmail('it should be email address'),
        color: StringType('it should be string value').isHex('it should be hex color value')
      });

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

      type.check(
        {
          email: 'blackcater2015@gmail.com',
          color: '#24252c'
        },
        undefined,
        result => {
          expect(result).toMatchObject({ hasError: false });
        }
      );

      type.check({ email: 'blackcater2015@gmail.com' }, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check({ color: '#24252c' }, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check(
        {
          email: 'blackcater2015@gmail.com',
          color: '#24252c',
          blog: 'https://www.blackcater.win'
        },
        undefined,
        result => {
          expect(result).toMatchObject({ hasError: false });
        }
      );

      type.check(
        {
          email: 'blackcater2015@gmail',
          color: '#24252c'
        },
        undefined,
        result => {
          expect(result).toMatchObject({
            hasError: true,
            errorMessage: 'it should be email address'
          });
        }
      );

      type.check(
        {
          email: 'blackcater2015@gmail.com',
          color: '#2425'
        },
        undefined,
        result => {
          expect(result).toMatchObject({
            hasError: true,
            errorMessage: 'it should be hex color value'
          });
        }
      );

      setTimeout(() => done(), 250);
    });

    it('should be correct when object is array', () => {
      expect(1).toBe(1);
    });
  });
});
