import Type from '../src/Type';

describe('@Type', () => {
  describe('#constructor', () => {
    it('should be initialized correctly', () => {
      const type = new Type('test type');

      expect(type.name).toBe('test type');
      expect(type.required).toBe(false);
      expect(type.requiredMessage).toBeFalsy();
      expect(type.rules).toHaveLength(0);
    });
  });

  describe('#addRule', () => {
    it('should have correct number of rules', () => {
      const type = new Type('test type');
      const fnGen = result => jest.fn((v, _, next) => next(result));

      expect(type.name).toBe('test type');
      expect(type.required).toBe(false);
      expect(type.requiredMessage).toBeFalsy();
      expect(type.rules).toHaveLength(0);

      const fn1 = fnGen(false);

      type.addRule(fn1, 'fn1 error message');

      expect(type.rules).toHaveLength(1);
      expect(type.rules[0]).toMatchObject({
        onValid: fn1,
        errorMessage: 'fn1 error message'
      });

      const fn2 = fnGen(false);

      type.addRule(fn2);

      expect(type.rules).toHaveLength(2);
      expect(type.rules[1]).toMatchObject({
        onValid: fn2,
        errorMessage: 'fn1 error message'
      });

      const fn3 = fnGen(false);

      type.addRule(fn3, 'fn3 error message');

      expect(type.rules).toHaveLength(3);
      expect(type.rules[2]).toMatchObject({
        onValid: fn3,
        errorMessage: 'fn3 error message'
      });
    });

    it('should be correct with single rule', done => {
      expect.assertions(8);

      const typeGen = name => new Type(name);
      const fnGen = result => jest.fn((v, _, next) => next(result));

      const type1 = typeGen('type1');
      const fn1 = fnGen(false);

      type1.addRule(fn1, 'fn1 error message');

      type1.check(undefined, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type1.check(null, result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type1.check('', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type1.check([], result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'fn1 error message' });
      });

      const type2 = typeGen('type2');
      const fn2 = fnGen(true);

      type2.addRule(fn2, 'fn2 error message');

      type2.check([], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      const type3 = typeGen('type3');
      const fn3 = fnGen('error message');

      type3.addRule(fn3, 'fn3 error message');

      type3.check([], result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'error message' });
      });

      const type4 = typeGen('type4');
      const fn4 = fnGen({ hasError: false });

      type4.addRule(fn4, 'fn4 error message');

      type4.check([], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      const type5 = typeGen('type5');
      const fn5 = fnGen({ hasError: true, errorMessage: 'error message' });

      type5.addRule(fn5, 'fn5 error message');

      type5.check([], result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'error message' });
      });

      setTimeout(() => done(), 250);
    });

    it('should be correct with multiple rules', done => {
      expect.assertions(6);

      const typeGen = name => new Type(name);
      const fnGen = result => jest.fn((v, _, next) => next(result));

      // 2 rules without error
      const type1 = typeGen('type1');
      const fn11 = fnGen();
      const fn12 = fnGen();

      type1.addRule(fn11, 'fn11 error message');
      type1.addRule(fn12, 'fn12 error message');

      type1.check([], result => {
        expect(result).toMatchObject({ hasError: false });
      });

      // 2 rules, 1st rule with error
      const type2 = typeGen('type2');
      const fn21 = fnGen(false);
      const fn22 = fnGen();

      type2.addRule(fn21, 'fn21 error message');
      type2.addRule(fn22, 'fn22 error message');

      type2.check([], result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'fn21 error message' });
      });

      // 2 rules, 2ed rule with error
      const type3 = typeGen('type3');
      const fn31 = fnGen();
      const fn32 = fnGen(false);

      type3.addRule(fn31, 'fn31 error message');
      type3.addRule(fn32, 'fn32 error message');

      type3.check([], result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'fn32 error message' });
      });

      // isRequired
      const type4 = typeGen('type4');
      const fn41 = fnGen();
      const fn42 = fnGen(false);

      type4.addRule(fn41, 'fn41 error message');
      type4.addRule(fn42, 'fn42 error message');

      type4.isRequired('type4 is required');

      type4.check([], result => {
        expect(fn41).not.toHaveBeenCalled();
        expect(fn42).not.toHaveBeenCalled();
        expect(result).toMatchObject({ hasError: true, errorMessage: 'type4 is required' });
      });

      setTimeout(() => done(), 250);
    });
  });

  describe('#isReqired', () => {
    it('should be correct', done => {
      expect.assertions(11);

      const type = new Type('test type');

      expect(type.name).toBe('test type');
      expect(type.required).toBe(false);
      expect(type.requiredMessage).toBeFalsy();
      expect(type.rules).toHaveLength(0);

      type.isRequired('This field is required');

      expect(type.name).toBe('test type');
      expect(type.required).toBe(true);
      expect(type.requiredMessage).toBe('This field is required');
      expect(type.rules).toHaveLength(0);

      type.check('some value', result => {
        expect(result).toMatchObject({ hasError: false });
      });

      type.check('', result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'This field is required' });
      });

      type.check(undefined, result => {
        expect(result).toMatchObject({ hasError: true, errorMessage: 'This field is required' });
      });

      setTimeout(() => done(), 250);
    });
  });
});
