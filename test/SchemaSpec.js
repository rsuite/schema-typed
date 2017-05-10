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
        let checkResult = schema.checkForField('data', "2.22");

        checkResult.should.have.property('hasError').be.a('boolean');
    });


    it('should return error information', () => {

        const userModel = SchemaModel({
            username: StringType().isRequired('用户名不能为空'),
            email: StringType().isEmail('请输入正确的邮箱'),
            age: NumberType('年龄应该是一个数字').range(18, 30, '年应该在 18 到 30 岁')
        });

        const checkStatus = userModel.check({
            username: 'foobar',
            email: 'foo@bar.com',
            age: 40
        });


    });





});
