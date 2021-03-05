const should = require('chai').should();
const schema = require('../src');
const { ArrayType, StringType, NumberType, ObjectType, Schema } = schema;

describe('#ArrayType', () => {
  it('Should be a valid array', () => {
    const schemaData = {
      data: ArrayType().minLength(2, 'abc').of(StringType().isEmail('应该是一个 email'), '格式错误')
    };
    const schema = new Schema(schemaData);

    const check1 = schema.checkForField('data', [
      'simon.guo@hypers.com',
      'ddddd@d.com',
      'ddd@bbb.com'
    ]);

    check1.array[0].hasError.should.equal(false);
    check1.array[1].hasError.should.equal(false);
    check1.array[2].hasError.should.equal(false);

    const check2 = schema.check({
      data: ['simon.guo@hypers.com', 'error_email', 'ddd@bbb.com']
    });

    check2.data.array[1].hasError.should.equal(true);
    check2.data.array[1].errorMessage.should.equal('应该是一个 email');
  });

  it('Should output default error message ', () => {
    const schemaData = { data: ArrayType().of(StringType().isEmail(), '格式错误') };
    const schema = new Schema(schemaData);
    const checkStatus = schema.checkForField('data', [
      'simon.guo@hypers.com',
      'error_email',
      'ddd@bbb.com'
    ]);

    checkStatus.array[1].hasError.should.equal(true);
    checkStatus.array[1].errorMessage.should.equal('Please enter a valid string');
  });

  it('Should support array nested objects', () => {
    const schemaData = {
      users: ArrayType().of(
        ObjectType('应该是一个对象').shape({
          email: StringType().isEmail('应该是一个 email'),
          age: NumberType().min(18, '年龄应该大于18岁')
        })
      )
    };
    const schema = new Schema(schemaData);
    const checkStatus = schema.check({
      users: [
        'simon.guo@hypers.com',
        { email: 'error_email', age: 19 },
        { email: 'error_email', age: 17 }
      ]
    });

    checkStatus.users.array[0].hasError.should.equal(true);
    checkStatus.users.array[0].errorMessage.should.equal('应该是一个对象');
    checkStatus.users.array[1].object.email.hasError.should.equal(true);
    checkStatus.users.array[1].object.email.errorMessage.should.equal('应该是一个 email');
    checkStatus.users.array[1].object.age.hasError.should.equal(false);

    checkStatus.users.array[2].object.email.hasError.should.equal(true);
    checkStatus.users.array[2].object.email.errorMessage.should.equal('应该是一个 email');
    checkStatus.users.array[2].object.age.hasError.should.equal(true);
    checkStatus.users.array[2].object.age.errorMessage.should.equal('年龄应该大于18岁');
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
