import chai from 'chai';
import { formatErrorMessage, checkRequired, shallowEqual, pathTransform } from '../src/utils';

chai.should();

describe('#utils', () => {
  describe('## formatErrorMessage', () => {
    it('Should output the parameter `email`', () => {
      const str = formatErrorMessage('${name} is a required field', { name: 'email' });
      const str2 = formatErrorMessage('${name} is a required field', { name1: 'email' });
      str.should.equal('email is a required field');
      str2.should.equal('${name} is a required field');
    });

    it('Should output multiple parameters', () => {
      const str = formatErrorMessage('${name} must contain ${minLength} to ${maxLength} items', {
        name: 'tag',
        minLength: 3,
        maxLength: 10
      });

      const str2 = formatErrorMessage('${name} must contain ${minLength} to ${maxLength} items', {
        name: 'tag',
        minLength1: 3,
        maxLength: 10
      });
      str.should.equal('tag must contain 3 to 10 items');
      str2.should.equal('tag must contain ${minLength} to 10 items');
    });

    it('Should not replace parameters', () => {
      const str = formatErrorMessage('name is a required field');
      str.should.equal('name is a required field');
    });

    it('Should return unprocessed parameters', () => {
      const str = formatErrorMessage(true);
      str.should.equal(true);
    });
  });

  describe('## checkRequired', () => {
    it('Should check string, null and undefined', () => {
      checkRequired('1').should.equal(true);
      checkRequired(0).should.equal(true);
      checkRequired(' ').should.equal(true);
      checkRequired(' ', true).should.equal(false);

      checkRequired('').should.equal(false);
      checkRequired().should.equal(false);
      checkRequired(null).should.equal(false);

      checkRequired('', false, true).should.equal(true);
      checkRequired(undefined, false, true).should.equal(false);
      checkRequired(null, false, true).should.equal(false);
    });

    it('Should check array', () => {
      checkRequired([]).should.equal(false);
      checkRequired([1]).should.equal(true);
      checkRequired([undefined]).should.equal(true);
      checkRequired(['']).should.equal(true);
    });
  });

  describe('## shallowEqual', () => {
    it('Should compare the object', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const obj3 = { a: 1, b: 3 };
      const obj4 = { a: 1, b: 2, c: 3 };

      shallowEqual(obj1, obj2).should.equal(true);
      shallowEqual(obj1, obj3).should.equal(false);
      shallowEqual(obj1, obj4).should.equal(false);
    });

    it('Should compare the array', () => {
      const arr1 = [1, 2];
      const arr2 = [1, 2];
      const arr3 = [1, 3];
      const arr4 = [1, 2, 3];

      shallowEqual(arr1, arr2).should.equal(true);
      shallowEqual(arr1, arr3).should.equal(false);
      shallowEqual(arr1, arr4).should.equal(false);
    });

    it('Should compare the object and array', () => {
      const obj = { a: 1, b: [1, 2] };
      const obj1 = { a: 1, b: [1, 2] };
      const obj2 = { a: 1, b: [1, 3] };
      const obj3 = { a: 1, b: [1, 2, 3] };

      shallowEqual(obj, obj1).should.equal(false);
      shallowEqual(obj, obj2).should.equal(false);
      shallowEqual(obj, obj3).should.equal(false);
    });
  });

  describe('## pathTransform', () => {
    it('Should transform the path', () => {
      pathTransform('a').should.equal('a');
      pathTransform('a.b').should.equal('a.object.b');
      pathTransform('a.0').should.equal('a.array.0');
      pathTransform('a.0.1').should.equal('a.array.0.array.1');
      pathTransform('a.b.c').should.equal('a.object.b.object.c');
      pathTransform('a.0.b').should.equal('a.array.0.object.b');
    });
  });
});
