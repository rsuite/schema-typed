const should = require('chai').should();
const schema = require('../src');

const { StringType, NumberType, Schema } = schema;

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



});
