import { expect } from 'chai';
import * as schema from '../src';

const { ArrayType, StringType, NumberType, ObjectType, Schema } = schema;

describe('#ArrayType', () => {
  it('Should be a valid array', () => {
    const schemaData = {
      data: ArrayType().minLength(2, 'error1').of(StringType().isEmail('error2')),
      data2: ArrayType().minLength(2).of(StringType().isEmail())
    };

    const schema = new Schema(schemaData);

    const checkResult = schema.checkForField('data', {
      data: ['simon.guo@hypers.com', 'ddddd@d.com', 'ddd@bbb.com']
    });

    expect(checkResult).to.deep.equal({
      hasError: false,
      array: [{ hasError: false }, { hasError: false }, { hasError: false }]
    });

    const checkResult2 = schema.check({
      data: ['simon.guo@hypers.com', 'error_email', 'ddd@bbb.com']
    });

    expect(checkResult2).to.deep.equal({
      data: {
        hasError: true,
        array: [
          { hasError: false },
          { hasError: true, errorMessage: 'error2' },
          { hasError: false }
        ]
      },
      data2: { hasError: false }
    });

    const checkResult3 = schema.check({
      data2: []
    });

    expect(checkResult3).to.deep.equal({
      data: { hasError: false },
      data2: { hasError: true, errorMessage: 'data2 field must have at least 2 items' }
    });

    const checkResult4 = schema.check({
      data2: ['simon.guo@hypers.com', 'error_email', 'ddd@bbb.com']
    });

    expect(checkResult4).to.deep.equal({
      data: { hasError: false },
      data2: {
        hasError: true,
        array: [
          { hasError: false },
          { hasError: true, errorMessage: 'data2.[1] must be a valid email' },
          { hasError: false }
        ]
      }
    });
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
    const checkResult = schema.check({
      users: [
        'simon.guo@hypers.com',
        { email: 'error_email', age: 19 },
        { email: 'error_email', age: 17 }
      ]
    });

    expect(checkResult).to.deep.equal({
      users: {
        hasError: true,
        array: [
          { hasError: true, errorMessage: 'error1' },
          {
            hasError: true,
            object: { email: { hasError: true, errorMessage: 'error2' }, age: { hasError: false } }
          },
          {
            hasError: true,
            object: {
              email: { hasError: true, errorMessage: 'error2' },
              age: { hasError: true, errorMessage: 'error3' }
            }
          }
        ]
      },
      users2: { hasError: false }
    });

    const schema2 = new Schema(schemaData);
    const checkResult2 = schema2.check({
      users2: [
        'simon.guo@hypers.com',
        { email: 'error_email', age: 19 },
        { email: 'error_email', age: 17 }
      ]
    });

    expect(checkResult2).to.deep.equal({
      users: { hasError: false },
      users2: {
        hasError: true,
        array: [
          { hasError: true, errorMessage: 'users2.[0] must be an object' },
          {
            hasError: true,
            object: {
              email: { hasError: true, errorMessage: 'email must be a valid email' },
              age: { hasError: false }
            }
          },
          {
            hasError: true,
            object: {
              email: { hasError: true, errorMessage: 'email must be a valid email' },
              age: { hasError: true, errorMessage: 'age must be greater than or equal to 18' }
            }
          }
        ]
      }
    });
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
