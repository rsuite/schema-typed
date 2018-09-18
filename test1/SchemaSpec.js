const should = require('chai').should();
const schema = require('../src');

const { StringType, NumberType, Schema, SchemaModel } = schema;

describe('#Schema', () => {
  it('save Schema as proporty', () => {
    let schemaData = { data: StringType() };
    let schema = new Schema(schemaData);
    schema.schema.should.equal(schemaData);
  });

  it('get field value type of given field name', () => {
    let schemaData = { data: NumberType() };
    let schema = new Schema(schemaData);
    schema.getFieldType('data').should.equal(schemaData.data);
  });

  it('should return error information', () => {
    let schemaData = { data: NumberType() };
    let schema = new Schema(schemaData);
    let checkResult = schema.checkForField('data', '2.22');

    checkResult.should.have.property('hasError').be.a('boolean');
  });

  it('should return error information', () => {
    const model = SchemaModel({
      username: StringType().isRequired('用户名不能为空'),
      email: StringType().isEmail('请输入正确的邮箱'),
      age: NumberType('年龄应该是一个数字').range(18, 30, '年应该在 18 到 30 岁')
    });

    const checkStatus = model.check({
      username: 'foobar',
      email: 'foo@bar.com',
      age: 40
    });

    checkStatus.username.hasError.should.equal(false);
    checkStatus.email.hasError.should.equal(false);
    checkStatus.age.hasError.should.equal(true);
  });

  describe('## getKeys', () => {
    it('should return keys', () => {
      const model = SchemaModel({
        username: StringType(),
        email: StringType(),
        age: NumberType()
      });

      model.getKeys().length.should.equals(3);
      model.getKeys()[0].should.equals('username');
      model.getKeys()[1].should.equals('email');
      model.getKeys()[2].should.equals('age');
    });
  });

  describe('## static combine', () => {
    it('Should return a combined model.    ', () => {
      const model1 = SchemaModel({
        username: StringType().isRequired('用户名不能为空'),
        email: StringType().isEmail('请输入正确的邮箱')
      });

      const model1CheckStatus = model1.check({
        username: 'foobar',
        email: 'foo@bar.com',
        age: 40
      });

      model1CheckStatus.username.hasError.should.equal(false);
      model1CheckStatus.email.hasError.should.equal(false);

      const model2 = SchemaModel({
        username: StringType()
          .isRequired('用户名不能为空')
          .minLength(7, '最少7个字符'),
        age: NumberType().range(18, 30, '年应该在 18 到 30 岁')
      });

      const model3 = SchemaModel.combine(model1, model2);

      const checkStatus = model3.check({
        username: 'fooba',
        email: 'foo@bar.com',
        age: 40
      });

      checkStatus.username.hasError.should.equal(true);
      checkStatus.email.hasError.should.equal(false);
      checkStatus.age.hasError.should.equal(true);
    });
  });
});
