/* eslint-disable @typescript-eslint/no-var-requires */
require('chai').should();
const schema = require('../src');
const { StringType, SchemaModel } = schema;

describe('#StringType', () => {
  it('Should check min string length', () => {
    const schema = SchemaModel({
      str: StringType().minLength(5),
      cjkStr: StringType().minLength(5, ''),
      emojiStr: StringType().minLength(5, '')
    });

    schema.checkForField('str', { str: 'abcde' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'abcd' }).hasError.should.equal(true);

    schema.checkForField('cjkStr', { cjkStr: '鲤鱼跃龙门' }).hasError.should.equal(false);
    schema.checkForField('cjkStr', { cjkStr: '岁寒三友' }).hasError.should.equal(true);
    schema.checkForField('emojiStr', { emojiStr: '👌👍🐱🐶🐸' }).hasError.should.equal(false);

    schema.checkForField('emojiStr', { emojiStr: '👌👍🐱🐶' }).hasError.should.equal(true);

    schema
      .checkForField('str', { str: 'a' })
      .errorMessage.should.equal('str must be at least 5 characters');
  });

  it('Should check max string length', () => {
    const schema = SchemaModel({
      str: StringType().maxLength(4),
      cjkStr: StringType().maxLength(4, ''),
      emojiStr: StringType().maxLength(4, '')
    });

    schema.checkForField('str', { str: 'abcde' }).hasError.should.equal(true);
    schema.checkForField('str', { str: 'abcd' }).hasError.should.equal(false);
    schema.checkForField('cjkStr', { cjkStr: '鲤鱼跃龙门' }).hasError.should.equal(true);
    schema.checkForField('cjkStr', { cjkStr: '岁寒三友' }).hasError.should.equal(false);
    schema.checkForField('emojiStr', { emojiStr: '👌👍🐱🐶🐸' }).hasError.should.equal(true);
    schema.checkForField('emojiStr', { emojiStr: '👌👍🐱🐶' }).hasError.should.equal(false);

    schema
      .checkForField('str', { str: 'abcde' })
      .errorMessage.should.equal('str must be at most 4 characters');
  });

  it('Should be required', () => {
    const schema = SchemaModel({
      str: StringType().isRequired('isrequired'),
      str1: StringType().isRequired(),
      str2: StringType().isRequired('isrequired', false)
    });

    schema.checkForField('str', { str: '' }).hasError.should.equal(true);
    schema.checkForField('str', { str: ' abcde ' }).hasError.should.equal(false);
    schema.checkForField('str', { str: '  ' }).hasError.should.equal(true);

    schema
      .checkForField('str1', { str1: '' })
      .errorMessage.should.equal('str1 is a required field');

    schema.checkForField('str2', { str2: '' }).hasError.should.equal(true);
    schema.checkForField('str2', { str2: ' abcde ' }).hasError.should.equal(false);
    schema.checkForField('str2', { str2: '  ' }).hasError.should.equal(false);
  });

  it('Should be able to customize the rules', () => {
    const schema = SchemaModel({
      str: StringType()
        .maxLength(4, 'error1')
        .addRule(value => value !== '123', 'error2')
    });

    schema.checkForField('str', { str: '12' }).hasError.should.equal(false);

    schema.checkForField('str', { str: '123' }).hasError.should.equal(true);
    schema.checkForField('str', { str: '123' }).errorMessage.should.equal('error2');
    schema.checkForField('str', { str: 'abcde' }).hasError.should.equal(true);
    schema.checkForField('str', { str: 'abcde' }).errorMessage.should.equal('error1');
  });

  it('Should be one of value in array', () => {
    const schema = SchemaModel({
      str: StringType().isOneOf(['A', 'B', 'C'], 'error'),
      str1: StringType().isOneOf(['A', 'B', 'C'])
    });
    schema.checkForField('str', { str: 'A' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'D' }).hasError.should.equal(true);
    schema.checkForField('str', { str: 'D' }).errorMessage.should.equal('error');
    schema
      .checkForField('str1', { str1: 'D' })
      .errorMessage.should.equal('str1 must be one of the following values: A,B,C');
  });
});
