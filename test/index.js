var should = require('chai').should();
var schema = require('../lib');
var schemaBuilder = schema.SchemaBuilder;
var stringType = schema.StringType;
var numberType = schema.NumberType;

describe('#SchemaBuilder', () => {
    it('save Schema as proporty', () => {
        let schemaData = { data: stringType() };
        let schema = schemaBuilder(schemaData);
        schema.schema.should.equal(schemaData);
    });

    it('get field value type of given field name', () => {
        let schemaData = { data: numberType() };
        let schema = schemaBuilder(schemaData);
        schema.getFieldType('data').should.equal(schemaData.data);
    });

    it('should return error information', () => {
        let schemaData = { data: numberType() };
        let schema = schemaBuilder(schemaData);
        let checkResult = schema.checkForField('data', 233);
        checkResult.should.have.property('err').be.a('boolean');
    });
});
