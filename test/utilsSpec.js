/* eslint-disable @typescript-eslint/no-var-requires */
require('chai').should();
const { formatErrorMessage, checkRequired } = require('../src/utils');

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
});
