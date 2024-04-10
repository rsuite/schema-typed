import { expect } from 'chai';
import { formatErrorMessage, checkRequired, get, set, shallowEqual } from '../src/utils';

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

  describe('## get', () => {
    it('Should get the value of the object', () => {
      const obj = { a: { b: { c: 1 } } };
      get(obj, 'a.b.c').should.equal(1);
      get(obj, 'a.b').should.deep.equal({ c: 1 });
      get(obj, 'a').should.deep.equal({ b: { c: 1 } });

      expect(get(obj, 'a.b.d')).to.be.undefined;
      expect(get(obj, 'a.b.d.e')).to.be.undefined;
      expect(get(obj, 'a.b.d.e.f')).to.be.undefined;
    });

    it('Should get the value of the array', () => {
      const obj = { a: [{ b: 1 }, { b: 2 }] };
      get(obj, 'a.0.b').should.equal(1);
      get(obj, 'a.1.b').should.equal(2);
      expect(get(obj, 'a.2.b')).to.be.undefined;
    });

    it('Should get the value of the array and object', () => {
      const obj = { a: [{ b: { c: 1 } }, { b: { c: 2 } }] };
      get(obj, 'a.0.b.c').should.equal(1);
      get(obj, 'a.1.b.c').should.equal(2);
      expect(get(obj, 'a.2.b.c')).to.be.undefined;
    });

    it('Should return the default value', () => {
      const obj = { a: { b: [{ c: 1 }, { c: 2 }] } };
      expect(get(obj, 'a.b.2.c', 10)).to.equal(10);
      expect(get(undefined, 'a.b', 10)).to.equal(10);
    });
  });

  describe('## set', () => {
    it('Should set the value of the object', () => {
      const obj = { a: { b: { c: 1 } } };
      set(obj, 'a.b.c', 2);
      obj.a.b.c.should.equal(2);
      set(obj, 'a.b', { c: 3 });
      obj.a.b.should.deep.equal({ c: 3 });
      set(obj, 'a', { b: { c: 4 } });
      obj.a.should.deep.equal({ b: { c: 4 } });
    });

    it('Should set the value of the array', () => {
      const obj = { a: [{ b: 1 }, { b: 2 }] };
      set(obj, 'a.0.b', 3);
      obj.a[0].b.should.equal(3);
      set(obj, 'a.1.b', 4);
      obj.a[1].b.should.equal(4);
    });

    it('Should set the value of the array and object', () => {
      const obj = { a: [{ b: { c: 1 } }, { b: { c: 2 } }] };
      set(obj, 'a.0.b.c', 3);
      obj.a[0].b.c.should.equal(3);
      set(obj, 'a.1.b.c', 4);
      obj.a[1].b.c.should.equal(4);
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
});
