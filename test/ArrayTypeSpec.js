const should = require('chai').should();
const schema = require('../src');
const { ArrayType, StringType, Schema } = schema;

describe('#ArrayType', () => {

  let schemaData1 = { data: ArrayType().of(StringType().isEmail('应该是一个 email'), '格式错误') };
  let schemaData2 = { data: ArrayType().of(StringType().isEmail(), '格式错误') };


  it('Should be a valid array', () => {

    let schema = new Schema(schemaData1);
    let schema2 = new Schema(schemaData2);

    schema.checkForField('data', ['simon.guo@hypers.com', 'ddddd@d.com', 'ddd@bbb.com']).hasError.should.equal(false);
    let checkStatus = schema.checkForField('data', ['simon.guo@hypers.com', 'ddddd', 'ddd@bbb.com']);

    checkStatus.hasError.should.equal(true);
    checkStatus.errorMessage.should.equal('应该是一个 email');

    let checkStatus2 = schema2.checkForField('data', ['simon.guo@hypers.com', 'ddddd', 'ddd@bbb.com']);

    checkStatus2.hasError.should.equal(true);
    checkStatus2.errorMessage.should.equal('Please enter a valid string');

  });

});
