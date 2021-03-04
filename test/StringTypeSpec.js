const should = require('chai').should();
const schema = require('../src');
const { StringType, SchemaModel } = schema;

describe('#StringType', () => {
  it('Should check min string length', () => {
    const schema = SchemaModel({
      str: StringType().minLength(5, ''),
      cjkStr: StringType().minLength(5, ''),
      emojiStr: StringType().minLength(5, '')
    });

    schema.checkForField('str', 'abcde').hasError.should.equal(false);
    schema.checkForField('str', 'abcd').hasError.should.equal(true);

    schema.checkForField('cjkStr', '鲤鱼跃龙门').hasError.should.equal(false);
    schema.checkForField('cjkStr', '岁寒三友').hasError.should.equal(true);
    schema.checkForField('emojiStr', '👌👍🐱🐶🐸').hasError.should.equal(false);

    schema.checkForField('emojiStr', '👌👍🐱🐶').hasError.should.equal(true);
  });

  it('Should check max string length', () => {
    const schema = SchemaModel({
      str: StringType().maxLength(4, ''),
      cjkStr: StringType().maxLength(4, ''),
      emojiStr: StringType().maxLength(4, '')
    });

    schema.checkForField('str', 'abcde').hasError.should.equal(true);
    schema.checkForField('str', 'abcd').hasError.should.equal(false);
    schema.checkForField('cjkStr', '鲤鱼跃龙门').hasError.should.equal(true);
    schema.checkForField('cjkStr', '岁寒三友').hasError.should.equal(false);
    schema.checkForField('emojiStr', '👌👍🐱🐶🐸').hasError.should.equal(true);
    schema.checkForField('emojiStr', '👌👍🐱🐶').hasError.should.equal(false);
  });

  it('Should be required', () => {
    const schema = SchemaModel({
      str: StringType().isRequired('isrequired'),
      str2: StringType().isRequired('isrequired', false)
    });

    schema.checkForField('str', '').hasError.should.equal(true);
    schema.checkForField('str', ' abcde ').hasError.should.equal(false);
    schema.checkForField('str', '  ').hasError.should.equal(true);

    schema.checkForField('str2', '').hasError.should.equal(true);
    schema.checkForField('str2', ' abcde ').hasError.should.equal(false);
    schema.checkForField('str2', '  ').hasError.should.equal(false);
  });

  it('Should be able to customize the rules', () => {
    const schema = SchemaModel({
      str: StringType()
        .maxLength(4, 'error1')
        .addRule(value => value !== '123', 'error2')
    });

    schema.checkForField('str', '12').hasError.should.equal(false);

    schema.checkForField('str', '123').hasError.should.equal(true);
    schema.checkForField('str', '123').errorMessage.should.equal('error2');
    schema.checkForField('str', 'abcde').hasError.should.equal(true);
    schema.checkForField('str', 'abcde').errorMessage.should.equal('error1');
  });

  it('Should be one of value in array', () => {
    const schema = SchemaModel({
      str: StringType().isOneOf(['A', 'B', 'C'], 'error')
    });
    schema.checkForField('str', 'A').hasError.should.equal(false);
    schema.checkForField('str', 'D').hasError.should.equal(true);
    schema.checkForField('str', 'D').errorMessage.should.equal('error');
  });
});
