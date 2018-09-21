import StringType from '../src/StringType';

describe('@StringType', () => {
  describe('#constructor', () => {
    it('should be initialized correctly', done => {
      expect.assertions(9);

      const type = new StringType('it should be a string value');

      expect(type.name).toBe('string');
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

      type.check('string', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.containsLetter('it should contain letter');

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

      type.check('letter', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('123', result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should contain letter' });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.containsUppercaseLetter('it should contain uppercase letter');

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

      type.check('LETTER', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter', result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should contain uppercase letter'
        });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.containsLowercaseLetter('it should contain lowercase letter');

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

      type.check('letter', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('LETTER', result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should contain lowercase letter'
        });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.containsLetterOnly('it should only contain letter');

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

      type.check('letter', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter1', result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should only contain letter'
        });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.containsNumber('it should contain number');

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

      type.check('letter1', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter', result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should contain number' });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.isOneOf(['letter', 'Letter', 'LETTER'], 'it should contain one kind of letter');

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

      type.check('letter', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter1', result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should contain one kind of letter'
        });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.isEmail('it should be an email address');

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

      type.check('blackcater2015@gmail.com', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('blackcater', result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be an email address'
        });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.isURL('it should be a url');

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

      type.check('https://www.blackcater.win', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('blackcater', result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should be a url' });
      });

      type.check([], result => {
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
      expect.assertions(9);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.isHex('it should be a hex');

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

      type.check('#ccc', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('ccc', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('zzz', result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should be a hex' });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.pattern(/^[A-Z][a-z]{1,}$/, 'it should match pattern');

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

      type.check('Letter', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter', result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'it should match pattern' });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.rangeLength(0, 6, 'it should have less than six letters');

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

      type.check('Letter', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter1', result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have less than six letters'
        });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.minLength(6, 'it should have more than six letters');

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

      type.check('letter', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('l', result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have more than six letters'
        });
      });

      type.check([], result => {
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
      expect.assertions(8);

      const type = new StringType('it should be a string value');

      expect(type.rules).toHaveLength(1);

      type.maxLength(6, 'it should have less than six letters');

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

      type.check('letter', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('letter1', result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should have less than six letters'
        });
      });

      type.check([], result => {
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'it should be a string value'
        });
      });

      setTimeout(() => done(), 250);
    });
  });
});
