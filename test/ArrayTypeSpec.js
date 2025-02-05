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

  describe('Nested Object', () => {
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
              object: {
                email: { hasError: true, errorMessage: 'error2' },
                age: { hasError: false }
              }
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

    it('Should validate nested array with required fields', () => {
      const schema = new Schema({
        address: ArrayType().of(
          ObjectType().shape({
            city: StringType().isRequired('City is required'),
            postCode: StringType().isRequired('Post code is required')
          })
        )
      });

      const checkResult = schema.check({
        address: [
          { city: 'Shanghai', postCode: '200000' },
          { city: 'Beijing', postCode: '100000' }
        ]
      });

      expect(checkResult).to.deep.equal({
        address: {
          hasError: false,
          array: [
            {
              hasError: false,
              object: { city: { hasError: false }, postCode: { hasError: false } }
            },
            {
              hasError: false,
              object: { city: { hasError: false }, postCode: { hasError: false } }
            }
          ]
        }
      });

      const checkResult2 = schema.check({
        address: [{ postCode: '200000' }, { city: 'Beijing' }]
      });

      expect(checkResult2).to.deep.equal({
        address: {
          hasError: true,
          array: [
            {
              hasError: true,
              object: {
                city: {
                  hasError: true,
                  errorMessage: 'City is required'
                },
                postCode: {
                  hasError: false
                }
              }
            },
            {
              hasError: true,
              object: {
                city: {
                  hasError: false
                },
                postCode: {
                  hasError: true,
                  errorMessage: 'Post code is required'
                }
              }
            }
          ]
        }
      });
    });

    it('Should check a field in an array', () => {
      const schema = new Schema({
        address: ArrayType().of(
          ObjectType().shape({
            city: StringType().isRequired('City is required'),
            postCode: StringType().isRequired('Post code is required')
          })
        )
      });

      const checkResult = schema.checkForField('address[0].city', 'Shanghai', {
        nestedObject: true
      });

      expect(checkResult).to.deep.equal({
        hasError: false
      });

      const checkResult2 = schema.checkForField('address[1].postCode', '', {
        nestedObject: true
      });

      expect(checkResult2).to.deep.equal({
        hasError: true,
        errorMessage: 'Post code is required'
      });
    });

    it('Should check primitive type array items', () => {
      const schema = new Schema({
        emails: ArrayType().of(StringType().isEmail('Invalid email')),
        numbers: ArrayType().of(NumberType().min(0, 'Must be positive'))
      });

      // Test valid email
      expect(
        schema.checkForField('emails[0]', 'test@example.com', {
          nestedObject: true
        })
      ).to.deep.equal({
        hasError: false
      });

      // Test invalid email
      expect(
        schema.checkForField('emails[1]', 'invalid-email', {
          nestedObject: true
        })
      ).to.deep.equal({
        hasError: true,
        errorMessage: 'Invalid email'
      });

      // Test negative number
      expect(
        schema.checkForField('numbers[0]', -1, {
          nestedObject: true
        })
      ).to.deep.equal({
        hasError: true,
        errorMessage: 'Must be positive'
      });
    });

    it('Should support nested arrays', () => {
      const schema = new Schema({
        matrix: ArrayType().of(ArrayType().of(NumberType().min(0, 'Must be positive')))
      });

      // Test negative number in nested array
      expect(
        schema.checkForField('matrix[0][1]', -1, {
          nestedObject: true
        })
      ).to.deep.equal({
        hasError: true,
        errorMessage: 'matrix[0][1] must be an array'
      });
    });

    it('Should validate array elements with complex validation rules', () => {
      const schema = new Schema({
        users: ArrayType().of(
          ObjectType().shape({
            name: StringType().isRequired('Name is required'),
            age: NumberType().min(18, 'Must be an adult'),
            email: StringType().isEmail('Invalid email format')
          })
        )
      });

      // Test required field in array object
      expect(
        schema.checkForField('users[0].name', '', {
          nestedObject: true
        })
      ).to.deep.equal({
        hasError: true,
        errorMessage: 'Name is required'
      });

      // Test minimum value in array object
      expect(
        schema.checkForField('users[0].age', 16, {
          nestedObject: true
        })
      ).to.deep.equal({
        hasError: true,
        errorMessage: 'Must be an adult'
      });

      // Test email format in array object
      expect(
        schema.checkForField('users[0].email', 'invalid-email', {
          nestedObject: true
        })
      ).to.deep.equal({
        hasError: true,
        errorMessage: 'Invalid email format'
      });
    });

    it('Should validate nested array objects (max 3 levels)', () => {
      const schema = new Schema({
        users: ArrayType().of(
          ObjectType().shape({
            name: StringType().isRequired('Name required'),
            tasks: ArrayType().of(
              ObjectType().shape({
                title: StringType().isRequired('Task title required'),
                assignees: ArrayType().of(
                  ObjectType().shape({
                    email: StringType().isEmail('Invalid email format'),
                    role: StringType().isOneOf(['owner', 'member'], 'Invalid role'),
                    priority: NumberType().min(1, 'Priority must be at least 1').max(5, 'Priority cannot exceed 5')
                  })
                )
              })
            )
          })
        )
      });

      const data = {
        users: [{
          name: 'John',
          tasks: [{
            title: 'Frontend Development',
            assignees: [{
              email: 'test@example.com',
              role: 'owner',
              priority: 3
            }]
          }]
        }]
      };

      // Test valid email
      expect(schema.checkForField(
        'users[0].tasks[0].assignees[0].email',
        'test@example.com',
        { nestedObject: true, data }
      )).to.deep.equal({
        hasError: false
      });

      // Test invalid email
      expect(schema.checkForField(
        'users[0].tasks[0].assignees[0].email',
        'invalid-email',
        { nestedObject: true, data }
      )).to.deep.equal({
        hasError: true,
        errorMessage: 'Invalid email format'
      });

      // Test valid role
      expect(schema.checkForField(
        'users[0].tasks[0].assignees[0].role',
        'owner',
        { nestedObject: true, data }
      )).to.deep.equal({
        hasError: false
      });

      // Test invalid role
      expect(schema.checkForField(
        'users[0].tasks[0].assignees[0].role',
        'guest',
        { nestedObject: true, data }
      )).to.deep.equal({
        hasError: true,
        errorMessage: 'Invalid role'
      });

      // Test valid priority
      expect(schema.checkForField(
        'users[0].tasks[0].assignees[0].priority',
        3,
        { nestedObject: true, data }
      )).to.deep.equal({
        hasError: false
      });

      // Test invalid priority (too high)
      expect(schema.checkForField(
        'users[0].tasks[0].assignees[0].priority',
        6,
        { nestedObject: true, data }
      )).to.deep.equal({
        hasError: true,
        errorMessage: 'Priority cannot exceed 5'
      });

      // Test invalid priority (too low)
      expect(schema.checkForField(
        'users[0].tasks[0].assignees[0].priority',
        0,
        { nestedObject: true, data }
      )).to.deep.equal({
        hasError: true,
        errorMessage: 'Priority must be at least 1'
      });

      // Test required field present
      expect(schema.checkForField(
        'users[0].tasks[0].title',
        'Frontend Development',
        { nestedObject: true, data }
      )).to.deep.equal({
        hasError: false
      });

      // Test required field missing
      expect(schema.checkForField(
        'users[0].tasks[0].title',
        null,
        { nestedObject: true, data }
      )).to.deep.equal({
        hasError: true,
        errorMessage: 'Task title required'
      });
    });
  });
});
