const should = require('chai').should();
const schema = require('../src');
const { ArrayType, StringType, Schema } = schema;

describe('#ArrayType', () => {
  it('Should be a valid array', () => {
    const schemaData = {
      data: ArrayType().of(StringType().isEmail('应该是一个 email'), '格式错误')
    };
    const schema = new Schema(schemaData);

    schema
      .checkForField('data', ['simon.guo@hypers.com', 'ddddd@d.com', 'ddd@bbb.com'])
      .hasError.should.equal(false);
    const checkStatus = schema.checkForField('data', [
      'simon.guo@hypers.com',
      'error_email',
      'ddd@bbb.com'
    ]);

    checkStatus.hasError.should.equal(true);
    checkStatus.errorMessage.should.equal('应该是一个 email');
  });

  it('Should output default error message ', () => {
    const schemaData = { data: ArrayType().of(StringType().isEmail(), '格式错误') };
    const schema = new Schema(schemaData);
    const checkStatus = schema.checkForField('data', [
      'simon.guo@hypers.com',
      'error_email',
      'ddd@bbb.com'
    ]);

    checkStatus.hasError.should.equal(true);
    checkStatus.errorMessage.should.equal('Please enter a valid string');
  });

  it('Should be unrepeatable ', () => {
    const schemaData = { data: ArrayType().unrepeatable('不能有个重复数据') };
    const schema = new Schema(schemaData);
    const checkStatus = schema.checkForField('data', ['abc', '123', 'abc']);

    checkStatus.hasError.should.equal(true);
    checkStatus.errorMessage.should.equal('不能有个重复数据');
  });

  it('Should be required ', () => {
    const schemaData = { data: ArrayType().isRequired('不能为空') };
    const schema = new Schema(schemaData);
    const checkStatus = schema.checkForField('data', null);

    checkStatus.hasError.should.equal(true);
    checkStatus.errorMessage.should.equal('不能为空');

    schema.checkForField('data', []).hasError.should.equal(true);
    schema.checkForField('data', undefined).hasError.should.equal(true);
  });
});
