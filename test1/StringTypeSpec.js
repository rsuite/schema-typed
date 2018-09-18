const should = require('chai').should();
const schema = require('../src');
const { StringType, SchemaModel } = schema;

describe('#StringType', () => {
  it('Should check min string length', () => {
    const schema = SchemaModel({
      str: StringType().minLength(5, ''),
      cjkStr: StringType().minLength(5, ''),
      emojiStr: StringType().minLength(5, ''),
    });

    schema.checkForField('str', 'abcde').hasError.should.equal(false);
    schema.checkForField('str', 'abcd').hasError.should.equal(true);
    schema.checkForField('cjkStr', '鲤鱼跃龙门').hasError.should.equal(false);
    schema.checkForField('cjkStr', '岁寒三友').hasError.should.equal(true);
    schema.checkForField('emojiStr', '👌👍🐱🐶🐸').hasError.should.equal(false);
    schema.checkForField('emojiStr', '👌👍🐱🐶').hasError.should.equal(true);
  })

  it('Should check min string length', () => {
    const schema = SchemaModel({
      str: StringType().maxLength(4, ''),
      cjkStr: StringType().maxLength(4, ''),
      emojiStr: StringType().maxLength(4, ''),
    });

    schema.checkForField('str', 'abcde').hasError.should.equal(true);
    schema.checkForField('str', 'abcd').hasError.should.equal(false);
    schema.checkForField('cjkStr', '鲤鱼跃龙门').hasError.should.equal(true);
    schema.checkForField('cjkStr', '岁寒三友').hasError.should.equal(false);
    schema.checkForField('emojiStr', '👌👍🐱🐶🐸').hasError.should.equal(true);
    schema.checkForField('emojiStr', '👌👍🐱🐶').hasError.should.equal(false);
  })
});
