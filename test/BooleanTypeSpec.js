/* eslint-disable @typescript-eslint/no-var-requires */

require('chai').should();

const schema = require('../src');
const { BooleanType, Schema } = schema;

describe('#BooleanType', () => {
  it('Should be a valid boolean', () => {
    const schemaData = {
      data: BooleanType(),
      data2: BooleanType().isRequired()
    };

    const schema = new Schema(schemaData);

    schema.checkForField('data', { data: true }).hasError.should.equal(false);
    schema.checkForField('data', { data: false }).hasError.should.equal(false);
    schema.checkForField('data', { data: 0 }).hasError.should.equal(true);
    schema.checkForField('data', { data: '' }).hasError.should.equal(false);
    schema.checkForField('data', { data: null }).hasError.should.equal(false);
    schema.checkForField('data', { data: undefined }).hasError.should.equal(false);
    schema.checkForField('data', { data: 0 }).errorMessage.should.equal('data must be a boolean');

    schema.checkForField('data2', { data2: '' }).hasError.should.equal(true);
    schema.checkForField('data2', { data2: null }).hasError.should.equal(true);
    schema.checkForField('data2', { data2: undefined }).hasError.should.equal(true);
    schema
      .checkForField('data2', { data2: '' })
      .errorMessage.should.equal('data2 is a required field');
  });
});
