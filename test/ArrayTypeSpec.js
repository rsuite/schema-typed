/* eslint-disable @typescript-eslint/no-var-requires */

require('chai').should();

const schema = require('../src');
const { ArrayType, StringType, NumberType, ObjectType, Schema } = schema;

describe('#ArrayType', () => {
  it('Should be a valid array', () => {
    const schemaData = {
      data: ArrayType().minLength(2, 'error1').of(StringType().isEmail('error2')),
      data2: ArrayType().minLength(2).of(StringType().isEmail())
    };

    const schema = new Schema(schemaData);

    const check1 = schema.checkForField('data', {
      data: ['simon.guo@hypers.com', 'ddddd@d.com', 'ddd@bbb.com']
    });

    check1.hasError.should.equal(false);
    check1.array[0].hasError.should.equal(false);
    check1.array[1].hasError.should.equal(false);
    check1.array[2].hasError.should.equal(false);

    const check2 = schema.check({
      data: ['simon.guo@hypers.com', 'error_email', 'ddd@bbb.com']
    });

    check2.data.hasError.should.equal(true);
    check2.data.array[1].hasError.should.equal(true);
    check2.data.array[1].errorMessage.should.equal('error2');

    const check3 = schema.check({
      data2: []
    });

    check3.data2.errorMessage.should.equal('data2 field must have at least 2 items');

    const check4 = schema.check({
      data2: ['simon.guo@hypers.com', 'error_email', 'ddd@bbb.com']
    });

    check4.data2.array[1].errorMessage.should.equal('data2.[1] must be a valid email');
  });

  it('Should output default error message ', () => {
    const schemaData = { data: ArrayType().of(StringType().isEmail()) };
    const schema = new Schema(schemaData);
    const checkStatus = schema.checkForField('data', {
      data: ['simon.guo@hypers.com', 'error_email', 'ddd@bbb.com']
    });

    checkStatus.array[1].hasError.should.equal(true);
    checkStatus.array[1].errorMessage.should.equal('data.[1] must be a valid email');
  });

  it('Should support array nested objects', () => {
    const schemaData = {
      users: ArrayType().of(
        ObjectType('error1').shape({
          email: StringType().isEmail('error2'),
          age: NumberType().min(18, 'error3')
        })
      ),
      users2: ArrayType().of(
        ObjectType().shape({
          email: StringType().isEmail(),
          age: NumberType().min(18)
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

    checkStatus.users.hasError.should.equal(true);
    checkStatus.users.array[0].hasError.should.equal(true);
    checkStatus.users.array[0].errorMessage.should.equal('error1');
    checkStatus.users.array[1].object.email.hasError.should.equal(true);
    checkStatus.users.array[1].object.email.errorMessage.should.equal('error2');
    checkStatus.users.array[1].object.age.hasError.should.equal(false);

    checkStatus.users.array[2].object.email.hasError.should.equal(true);
    checkStatus.users.array[2].object.email.errorMessage.should.equal('error2');
    checkStatus.users.array[2].object.age.hasError.should.equal(true);
    checkStatus.users.array[2].object.age.errorMessage.should.equal('error3');

    const schema2 = new Schema(schemaData);
    const checkStatus2 = schema2.check({
      users2: [
        'simon.guo@hypers.com',
        { email: 'error_email', age: 19 },
        { email: 'error_email', age: 17 }
      ]
    });

    checkStatus2.users2.array[0].errorMessage.should.equal('users2.[0] must be an object');
    checkStatus2.users2.array[1].object.email.errorMessage.should.equal(
      'users2.[1] must be a valid email'
    );
    checkStatus2.users2.array[2].object.age.errorMessage.should.equal(
      'users2.[2] must be greater than or equal to 18'
    );
  });

  it('Should be unrepeatable ', () => {
    const schemaData = { data: ArrayType().unrepeatable('error1') };
    const schema = new Schema(schemaData);
    const checkStatus = schema.checkForField('data', { data: ['abc', '123', 'abc'] });

    checkStatus.hasError.should.equal(true);
    checkStatus.errorMessage.should.equal('error1');

    const schemaData2 = { data: ArrayType().unrepeatable() };
    const schema2 = new Schema(schemaData2);
    const checkStatus2 = schema2.checkForField('data', { data: ['abc', '123', 'abc'] });
    checkStatus2.errorMessage.should.equal('data must have non-repeatable items');

    schema.checkForField('data', { data: ['1', '2', '3'] }).hasError.should.equal(false);
  });

  it('Should be required ', () => {
    const schemaData = {
      data: ArrayType().isRequired('error1'),
      data2: ArrayType().isRequired()
    };
    const schema = new Schema(schemaData);
    const checkStatus = schema.checkForField('data', { data: null });
    const checkStatus2 = schema.checkForField('data2', { data2: null });

    checkStatus.hasError.should.equal(true);
    checkStatus.errorMessage.should.equal('error1');
    checkStatus2.errorMessage.should.equal('data2 is a required field');

    schema.checkForField('data', { data: [] }).hasError.should.equal(true);
    schema.checkForField('data', { data: undefined }).hasError.should.equal(true);
  });

  it('Should be within the number of items', () => {
    const schemaData = {
      data: ArrayType().rangeLength(2, 4)
    };
    const schema = new Schema(schemaData);
    schema.checkForField('data', { data: [1, 2] }).hasError.should.equal(false);
    schema.checkForField('data', { data: [1] }).hasError.should.equal(true);
    schema.checkForField('data', { data: [1, 2, 3, 4, 5] }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: [1] })
      .errorMessage.should.equal('data must contain 2 to 4 items');
  });

  it('Should not exceed the maximum number of items', () => {
    const schemaData = {
      data: ArrayType().maxLength(2)
    };
    const schema = new Schema(schemaData);
    schema.checkForField('data', { data: [1, 2, 3] }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: [1, 2, 3] })
      .errorMessage.should.equal('data field must have less than or equal to 2 items');
  });

  it('Should not be less than the maximum number of items', () => {
    const schemaData = {
      data: ArrayType().minLength(2)
    };
    const schema = new Schema(schemaData);
    schema.checkForField('data', { data: [1] }).hasError.should.equal(true);
    schema
      .checkForField('data', { data: [1] })
      .errorMessage.should.equal('data field must have at least 2 items');
  });
});
