const should = require('chai').should();
const schema = require('../src');
const { ObjectType, StringType, NumberType, Schema } = schema;

describe('#ObjectType', () => {
  let schemaData1 = {
    data: ObjectType().shape({
      email: StringType().isEmail('应该是一个 email'),
      age: NumberType().min(18, '年龄应该大于18岁')
    })
  };

  it('Should be a valid object', () => {
    let schema = new Schema(schemaData1);
    schema
      .checkForField('data', { email: 'simon.guo@hypers.com', age: 19 })
      .hasError.should.equal(false);
    schema.checkForField('data', { email: 'simon.guo', age: 19 }).hasError.should.equal(true);

    let checkStatus = schema.checkForField('data', { email: 'simon.guo@hypers.com', age: 17 });

    checkStatus.hasError.should.equal(true);
    checkStatus.errorMessage.should.equal('年龄应该大于18岁');
  });
});
