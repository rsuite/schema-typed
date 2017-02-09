var should = require('chai').should();
var schema = require('../lib');
var Schema = schema.Schema;
var stringType = schema.StringType;
var numberType = schema.NumberType;

describe('#Schema', () => {
    it('save Schema as proporty', () => {
        let schemaData = { data: stringType() };
        let schema = new Schema(schemaData);
        schema.schema.should.equal(schemaData);
    });


    it('get field value type of given field name', () => {
        let schemaData = { data: numberType() };
        let schema = new Schema(schemaData);
        schema.getFieldType('data').should.equal(schemaData.data);
    });

    it('should return error information', () => {
        let schemaData = { data: numberType() };
        let schema = new Schema(schemaData);
        let checkResult = schema.checkForField('data', "2.22");

        checkResult.should.have.property('hasError').be.a('boolean');
    });


    it('should valid NumberType ', () => {
        let schemaData = { data: numberType() };
        let schema = new Schema(schemaData);

        schema.checkForField('data', "2.22").hasError.should.equal(false);
        schema.checkForField('data', 2.22).hasError.should.equal(false);
        schema.checkForField('data', -222).hasError.should.equal(false);

    });

});
