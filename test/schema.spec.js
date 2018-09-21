const schema = require('../src');

const { StringType, NumberType, Schema, SchemaModel } = schema;

describe('#Schema', () => {
  it('save Schema as proporty', () => {
    const schemaData = { data: StringType() };
    const schemaInstance = new Schema(schemaData);

    expect(schemaInstance.schema).toBe(schemaData);
  });

  it('get field value type of given field name', () => {
    const schemaData = { data: NumberType() };
    const schemaInstance = new Schema(schemaData);

    expect(schemaInstance.getFieldType('data')).toBe(schemaData.data);
  });

  it('should return error information', done => {
    expect.assertions(1);

    const schemaData = { data: NumberType() };
    const schemaInstance = new Schema(schemaData);

    schemaInstance.checkForField('data', '2.22', result => {
      expect(result).toMatchObject({ hasError: false });
    });

    setTimeout(() => done(), 250);
  });

  it('should return error information', done => {
    expect.assertions(1);

    const model = SchemaModel({
      username: StringType().isRequired('用户名不能为空'),
      email: StringType().isEmail('请输入正确的邮箱'),
      age: NumberType('年龄应该是一个数字').range(18, 30, '年应该在 18 到 30 岁')
    });

    model.check(
      {
        username: 'foobar',
        email: 'foo@bar.com',
        age: 40
      },
      result => {
        expect(result).toMatchObject({
          username: { hasError: false },
          email: { hasError: false },
          age: { hasError: true, errorMessage: '年应该在 18 到 30 岁' }
        });
      }
    );

    setTimeout(() => done(), 250);
  });

  describe('## getKeys', () => {
    it('should return keys', () => {
      const model = SchemaModel({
        username: StringType(),
        email: StringType(),
        age: NumberType()
      });

      expect(model.getKeys()).toHaveLength(3);
      expect(model.getKeys()).toEqual(expect.arrayContaining(['username', 'email', 'age']));
    });
  });

  describe('## static combine', () => {
    it('should return a combined model.', done => {
      expect.assertions(2);

      const model1 = SchemaModel({
        username: StringType().isRequired('用户名不能为空'),
        email: StringType().isEmail('请输入正确的邮箱')
      });

      model1.check(
        {
          username: 'foobar',
          email: 'foo@bar.com',
          age: 40
        },
        result => {
          expect(result).toMatchObject({
            username: { hasError: false },
            email: { hasError: false }
          });
        }
      );

      const model2 = SchemaModel({
        username: StringType()
          .isRequired('用户名不能为空')
          .minLength(7, '最少7个字符'),
        age: NumberType().range(18, 30, '年应该在 18 到 30 岁')
      });

      const model3 = SchemaModel.combine(model1, model2);

      model3.check(
        {
          username: 'fooba',
          email: 'foo@bar.com',
          age: 40
        },
        result => {
          expect(result).toMatchObject({
            username: { hasError: true, errorMessage: '最少7个字符' },
            email: { hasError: false },
            age: { hasError: true, errorMessage: '年应该在 18 到 30 岁' }
          });
        }
      );

      setTimeout(() => done(), 250);
    });
  });
});
