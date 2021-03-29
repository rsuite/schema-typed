/* eslint-disable @typescript-eslint/no-var-requires */
require('chai').should();
const schema = require('../src');
const { NumberType, Schema } = schema;

describe('#NumberType', () => {
  let schemaData = { data: NumberType() };
  let schema = new Schema(schemaData);

  it('Should be a valid number', () => {
    schema.checkForField('data', { data: '2.22' }).hasError.should.equal(false);
    schema.checkForField('data', { data: 2.22 }).hasError.should.equal(false);
    schema.checkForField('data', { data: 2 }).hasError.should.equal(false);
    schema.checkForField('data', { data: -222 }).hasError.should.equal(false);
  });

  it('Should not be checked', () => {
    schema.checkForField('data', { data: null }).hasError.should.equal(false);
    schema.checkForField('data', { data: undefined }).hasError.should.equal(false);
    schema.checkForField('data', { data: '' }).hasError.should.equal(false);
  });

  it('Should be a invalid number', () => {
    schema.checkForField('data', { data: 'abc' }).hasError.should.equal(true);
    schema.checkForField('data', { data: '1abc' }).hasError.should.equal(true);
    schema.checkForField('data', { data: {} }).hasError.should.equal(true);
    schema.checkForField('data', { data: [] }).hasError.should.equal(true);
    schema.checkForField('data', { data: [] }).errorMessage.should.equal('data must be a number');
  });

  it('True should be a invalid number', () => {
    schema.checkForField('data', { data: true }).hasError.should.equal(true);
  });

  it('Function should be a invalid number', () => {
    schema.checkForField('data', { data: () => 0 }).hasError.should.equal(true);
  });

  it('Null and Undefined should be a invalid number', () => {
    let schemaData = { data: NumberType().isRequired() };
    let schema = new Schema(schemaData);
    schema.checkForField('data', { data: null }).hasError.should.equal(true);
    schema.checkForField('data', { data: undefined }).hasError.should.equal(true);
  });

  it('Should be an integer', () => {
    let schemaData = { data: NumberType().isInteger() };
    let schema = new Schema(schemaData);
    schema.checkForField('data', { data: 1 }).hasError.should.equal(false);
    schema.checkForField('data', { data: '1' }).hasError.should.equal(false);
    schema.checkForField('data', { data: -1 }).hasError.should.equal(false);
    schema.checkForField('data', { data: 1.1 }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: 1.1 })
      .errorMessage.should.equal('data must be an integer');
  });

  it('Should not be lower than the minimum', () => {
    let schemaData = { data: NumberType().min(10) };
    let schema = new Schema(schemaData);
    schema.checkForField('data', { data: 10 }).hasError.should.equal(false);
    schema.checkForField('data', { data: 9 }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: 9 })
      .errorMessage.should.equal('data must be greater than or equal to 10');
  });

  it('Should not exceed the maximum', () => {
    let schemaData = { data: NumberType().max(10) };
    let schema = new Schema(schemaData);
    schema.checkForField('data', { data: 10 }).hasError.should.equal(false);
    schema.checkForField('data', { data: 11 }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: 11 })
      .errorMessage.should.equal('data must be less than or equal to 10');
  });

  it('Should be within the range of optional values', () => {
    let schemaData = { data: NumberType().range(10, 20) };
    let schema = new Schema(schemaData);
    schema.checkForField('data', { data: 10 }).hasError.should.equal(false);
    schema.checkForField('data', { data: 20 }).hasError.should.equal(false);
    schema.checkForField('data', { data: 9 }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: 9 })
      .errorMessage.should.equal('data field must be between 10 and 20');
  });

  it('Should be within the following value range: 1,2,3,4', () => {
    let schemaData = { data: NumberType().isOneOf([1, 2, 3, 4]) };
    let schema = new Schema(schemaData);
    schema.checkForField('data', { data: 1 }).hasError.should.equal(false);
    schema.checkForField('data', { data: 2 }).hasError.should.equal(false);
    schema.checkForField('data', { data: 5 }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: 5 })
      .errorMessage.should.equal('data must be one of the following values: 1,2,3,4');
  });

  it('Should allow custom rules', () => {
    let schemaData = { data: NumberType().pattern(/^-?1\d+$/) };
    let schema = new Schema(schemaData);
    schema.checkForField('data', { data: 11 }).hasError.should.equal(false);
    schema.checkForField('data', { data: 12 }).hasError.should.equal(false);
    schema.checkForField('data', { data: 22 }).hasError.should.equal(true);
    schema.checkForField('data', { data: 22 }).errorMessage.should.equal('data is invalid');
  });
});
