/* eslint-disable @typescript-eslint/no-var-requires */

require('chai').should();

const schema = require('../src');
const { DateType, Schema } = schema;

describe('#DateType', () => {
  it('Should be a valid date', () => {
    const schemaData = {
      data: DateType(),
      data2: DateType().isRequired()
    };

    const schema = new Schema(schemaData);

    schema.checkForField('data', { data: new Date() }).hasError.should.equal(false);
    schema.checkForField('data', { data: 'date' }).hasError.should.equal(true);

    schema.checkForField('data', { data: '' }).hasError.should.equal(false);
    schema.checkForField('data', { data: null }).hasError.should.equal(false);
    schema.checkForField('data', { data: undefined }).hasError.should.equal(false);
    schema.checkForField('data', { data: 'date' }).errorMessage.should.equal('data must be a date');

    schema.checkForField('data2', { data2: '' }).hasError.should.equal(true);
    schema.checkForField('data2', { data2: null }).hasError.should.equal(true);
    schema.checkForField('data2', { data2: undefined }).hasError.should.equal(true);
    schema
      .checkForField('data2', { data2: '' })
      .errorMessage.should.equal('data2 is a required field');
  });

  it('Should be within the date range', () => {
    const schemaData = {
      data: DateType().range('2020-01-01', '2020-02-01')
    };
    const schema = new Schema(schemaData);
    schema.checkForField('data', { data: '2020-01-02' }).hasError.should.equal(false);
    schema.checkForField('data', { data: '2020-02-02' }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: '2020-02-02' })
      .errorMessage.should.equal('data field must be between 2020-01-01 and 2020-02-01');
  });

  it('Should not be less than the minimum date', () => {
    const schemaData = {
      data: DateType().min('2020-01-01')
    };
    const schema = new Schema(schemaData);
    schema.checkForField('data', { data: '2020-01-02' }).hasError.should.equal(false);
    schema.checkForField('data', { data: '2019-12-30' }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: '2019-12-30' })
      .errorMessage.should.equal('data field must be later than 2020-01-01');
  });

  it('Should not exceed the maximum date', () => {
    const schemaData = {
      data: DateType().max('2020-01-01')
    };
    const schema = new Schema(schemaData);
    schema.checkForField('data', { data: '2019-12-30' }).hasError.should.equal(false);
    schema.checkForField('data', { data: '2020-01-02' }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: '2020-01-02' })
      .errorMessage.should.equal('data field must be at earlier than 2020-01-01');
  });
});
