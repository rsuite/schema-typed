/* eslint-disable @typescript-eslint/no-var-requires */
require('chai').should();
const { expect } = require('chai');
const { formatErrorMessage, checkRequired, get } = require('../src/utils');

describe('#utils', () => {
  describe('## formatErrorMessage', () => {
    it('Should output the parameter `email`', () => {
      const str = formatErrorMessage('${name} is a required field', { name: 'email' });
      const str2 = formatErrorMessage('${name} is a required field', { name1: 'email' });
      str.should.equal('email is a required field');
      str2.should.equal('[name] is a required field');
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
      str2.should.equal('tag must contain [minLength] to 10 items');
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
});
