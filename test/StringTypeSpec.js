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

  it('Should contain letters', () => {
    const schema = SchemaModel({
      str: StringType().containsLetter()
    });
    schema.checkForField('str', { str: '12A' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'a12' }).hasError.should.equal(false);
    schema.checkForField('str', { str: '12' }).hasError.should.equal(true);
    schema
      .checkForField('str', { str: '-' })
      .errorMessage.should.equal('str field must contain letters');
  });

  it('Should only contain letters', () => {
    const schema = SchemaModel({
      str: StringType().containsLetterOnly()
    });
    schema.checkForField('str', { str: 'aA' }).hasError.should.equal(false);
    schema.checkForField('str', { str: '12A' }).hasError.should.equal(true);
    schema.checkForField('str', { str: 'a12' }).hasError.should.equal(true);
    schema.checkForField('str', { str: '12' }).hasError.should.equal(true);
    schema.checkForField('str', { str: '1a' }).errorMessage.should.equal('str must all be letters');
  });

  it('Should contain uppercase letters', () => {
    const schema = SchemaModel({
      str: StringType().containsUppercaseLetter()
    });
    schema.checkForField('str', { str: '12A' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'a12' }).hasError.should.equal(true);
    schema.checkForField('str', { str: '12' }).hasError.should.equal(true);
    schema
      .checkForField('str', { str: '-' })
      .errorMessage.should.equal('str must be a upper case string');
  });

  it('Should contain lowercase letters', () => {
    const schema = SchemaModel({
      str: StringType().containsLowercaseLetter()
    });
    schema.checkForField('str', { str: '12A' }).hasError.should.equal(true);
    schema.checkForField('str', { str: 'a12' }).hasError.should.equal(false);
    schema.checkForField('str', { str: '12' }).hasError.should.equal(true);
    schema
      .checkForField('str', { str: '-' })
      .errorMessage.should.equal('str must be a lowercase string');
  });

  it('Should contain numbers', () => {
    const schema = SchemaModel({
      str: StringType().containsNumber()
    });
    schema.checkForField('str', { str: '12' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'a12' }).hasError.should.equal(false);
    schema.checkForField('str', { str: '12A' }).hasError.should.equal(false);
    schema
      .checkForField('str', { str: 'a' })
      .errorMessage.should.equal('str field must contain numbers');
  });

  it('Should be a url', () => {
    const schema = SchemaModel({
      str: StringType().isURL(),
      email: StringType().isURL('', { allowMailto: true })
    });
    schema.checkForField('str', { str: 'https://www.abc.com' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'http://www.abc.com' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'ftp://www.abc.com' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'http://127.0.0.1/home' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'www.abc.com' }).hasError.should.equal(true);
    schema.checkForField('str', { str: 'a' }).errorMessage.should.equal('str must be a valid URL');
    schema.checkForField('str', { str: 'mailto:user@example.com' }).hasError.should.be.true;
    schema.checkForField('email', { email: 'mailto:user@example.com' }).hasError.should.be.false;
  });

  it('Should be a hexadecimal character', () => {
    const schema = SchemaModel({
      str: StringType().isHex()
    });
    schema.checkForField('str', { str: '#fff000' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'fff000' }).hasError.should.equal(false);
    schema.checkForField('str', { str: '#fff' }).hasError.should.equal(false);
    schema.checkForField('str', { str: 'fff' }).hasError.should.equal(false);
    schema.checkForField('str', { str: '#000' }).hasError.should.equal(false);
    schema.checkForField('str', { str: '#00' }).hasError.should.equal(true);
    schema
      .checkForField('str', { str: 'a' })
      .errorMessage.should.equal('str must be a valid hexadecimal');
  });

  it('Should allow custom rules', () => {
    let schema = SchemaModel({ data: StringType().pattern(/^-?1\d+$/) });
    schema.checkForField('data', { data: '11' }).hasError.should.equal(false);
    schema.checkForField('data', { data: '12' }).hasError.should.equal(false);
    schema.checkForField('data', { data: '22' }).hasError.should.equal(true);
    schema.checkForField('data', { data: '22' }).errorMessage.should.equal('data is invalid');
  });

  it('Should be within the range of the number of characters', () => {
    let schema = SchemaModel({ data: StringType().rangeLength(5, 10) });
    schema.checkForField('data', { data: '12345' }).hasError.should.equal(false);
    schema.checkForField('data', { data: '1234' }).hasError.should.equal(true);
    schema.checkForField('data', { data: '12345678910' }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: '1234' })
      .errorMessage.should.equal('data must contain 5 to 10 characters');
  });

  it('Should not be less than the minimum number of characters', () => {
    let schema = SchemaModel({ data: StringType().minLength(5) });
    schema.checkForField('data', { data: '12345' }).hasError.should.equal(false);
    schema.checkForField('data', { data: '1234' }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: '1234' })
      .errorMessage.should.equal('data must be at least 5 characters');
  });

  it('Should not exceed the maximum number of characters', () => {
    let schema = SchemaModel({ data: StringType().maxLength(5) });
    schema.checkForField('data', { data: '12345' }).hasError.should.equal(false);
    schema.checkForField('data', { data: '123456' }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: '123456' })
      .errorMessage.should.equal('data must be at most 5 characters');
  });
});
