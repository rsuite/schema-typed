import StringType from '../src/StringType';

describe('@StringType', () => {
  describe('#constructor', () => {
    it('should be initialized correctly', done => {
      const type = new StringType('it should be a string value');

      expect(type.name).toBe('string');
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

      type.check('string', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#containsLetter', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.containsLetter('it should contain letter');

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

      type.check('letter', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('123', undefined, result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should contain letter' });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#containsUppercaseLetter', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.containsUppercaseLetter('it should contain uppercase letter');

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

      type.check('LETTER', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should contain uppercase letter'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#containsLowercaseLetter', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.containsLowercaseLetter('it should contain lowercase letter');

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

      type.check('letter', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('LETTER', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should contain lowercase letter'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#containsLetterOnly', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.containsLetterOnly('it should only contain letter');

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

      type.check('letter', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter1', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should only contain letter'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#containsNumber', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.containsNumber('it should contain number');

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

      type.check('letter1', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter', undefined, result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should contain number' });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#isOneOf', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.isOneOf(['letter', 'Letter', 'LETTER'], 'it should contain one kind of letter');

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

      type.check('letter', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter1', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should contain one kind of letter'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#isEmail', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.isEmail('it should be an email address');

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

      type.check('blackcater2015@gmail.com', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('blackcater', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be an email address'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#isURL', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.isURL('it should be a url');

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

      type.check('https://www.blackcater.win', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('blackcater', undefined, result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should be a url' });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#isHex', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.isHex('it should be a hex');

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

      type.check('#ccc', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('ccc', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('zzz', undefined, result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should be a hex' });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#pattern', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.pattern(/^[A-Z][a-z]{1,}$/, 'it should match pattern');

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

      type.check('Letter', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter', undefined, result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should match pattern' });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#rangeLength', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.rangeLength(0, 6, 'it should have less than six letters');

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

      type.check('Letter', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter1', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have less than six letters'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#minLength', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.minLength(6, 'it should have more than six letters');

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

      type.check('letter', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('l', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have more than six letters'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#maxLength', () => {
    it('should be correct', done => {
      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.maxLength(6, 'it should have less than six letters');

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

      type.check('letter', undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter1', undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have less than six letters'
        });
      });

      type.check([], undefined, result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });
});
