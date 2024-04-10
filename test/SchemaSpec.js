import chai, { expect } from 'chai';
import * as schema from '../src';

const { StringType, NumberType, ObjectType, ArrayType, Schema, SchemaModel } = schema;

chai.should();

describe('#Schema', () => {
  it('The schema should be saved as proporty', () => {
    const schemaData = { data: StringType() };
    const schema = new Schema(schemaData);

    schema.$spec.should.equal(schemaData);
  });

  it('Should be able to get the field value type for the given field name', () => {
    const schemaData = { data: NumberType() };
    const schema = new Schema(schemaData);
    schema.getFieldType('data').should.equal(schemaData.data);
  });

  it('Should return error information', () => {
    const schemaData = { data: NumberType() };
    const schema = new Schema(schemaData);
    const checkResult = schema.checkForField('data', '2.22');

    checkResult.should.have.property('hasError').be.a('boolean');
  });

  it('Should return error information', () => {
    const model = SchemaModel({
      username: StringType().isRequired(),
      email: StringType().isEmail(),
      age: NumberType().range(18, 30)
    });

    const checkResult = model.check({
      username: 'foobar',
      email: 'foo@bar.com',
      age: 40
    });

    expect(checkResult).to.deep.equal({
      username: { hasError: false },
      email: { hasError: false },
      age: { hasError: true, errorMessage: 'age field must be between 18 and 30' }
    });
  });

  describe('## getKeys', () => {
    it('Should return keys', () => {
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

  describe('## getErrorMessages', () => {
    it('Should return error messages', () => {
      const model = SchemaModel({
        username: StringType().isRequired(),
        email: StringType().isEmail(),
        age: NumberType().range(18, 30)
      });

      model.check({
        username: 'foobar',
        email: ' ',
        age: 40
      });

      expect(model.getErrorMessages()).to.deep.equal([
        'email must be a valid email',
        'age field must be between 18 and 30'
      ]);

      expect(model.getErrorMessages('age')).to.deep.equal(['age field must be between 18 and 30']);
      expect(model.getErrorMessages('username')).to.deep.equal([]);
    });

    it('Should return error messages for nested object', () => {
      const model = SchemaModel({
        a: StringType().isRequired(),
        b: StringType().isEmail(),
        c: NumberType().range(18, 30),
        d: ObjectType().shape({
          e: StringType().isEmail().isRequired(),
          f: NumberType().range(50, 60)
        })
      });

      model.check({
        a: 'foobar',
        b: 'a',
        c: 40,
        d: { e: ' ', f: 40 }
      });

      expect(model.getErrorMessages()).to.deep.equal([
        'b must be a valid email',
        'c field must be between 18 and 30'
      ]);

      expect(model.getErrorMessages('d')).to.deep.equal([
        'e is a required field',
        'f field must be between 50 and 60'
      ]);

      expect(model.getErrorMessages('d.e')).to.deep.equal(['e is a required field']);
    });

    it('Should return error messages for nested array', () => {
      const model = SchemaModel({
        a: StringType().isRequired(),
        b: StringType().isEmail(),
        c: ArrayType()
          .of(
            ObjectType().shape({
              d: StringType().isEmail().isRequired(),
              e: NumberType().range(50, 60)
            })
          )
          .isRequired()
      });

      model.check({
        a: 'foobar',
        b: 'a',
        c: [{}, { d: ' ', e: 40 }]
      });

      expect(model.getErrorMessages()).to.deep.equal(['b must be a valid email']);
      expect(model.getErrorMessages('c.0.d')).to.deep.equal(['d is a required field']);
    });
  });

  describe('## getCheckResult', () => {
    it('Should return check results', () => {
      const model = SchemaModel({
        username: StringType().isRequired(),
        email: StringType().isEmail(),
        age: NumberType().range(18, 30)
      });

      model.check({
        username: 'foobar',
        email: ' ',
        age: 40
      });

      expect(model.getCheckResult()).to.deep.equal({
        username: { hasError: false },
        email: { hasError: true, errorMessage: 'email must be a valid email' },
        age: { hasError: true, errorMessage: 'age field must be between 18 and 30' }
      });

      expect(model.getCheckResult('age')).to.deep.equal({
        hasError: true,
        errorMessage: 'age field must be between 18 and 30'
      });

      expect(model.getCheckResult('username')).to.deep.equal({ hasError: false });
    });

    it('Should return check results for nested object', () => {
      const model = SchemaModel({
        a: StringType().isRequired(),
        b: StringType().isEmail(),
        c: NumberType().range(18, 30),
        d: ObjectType().shape({
          e: StringType().isEmail().isRequired(),
          f: NumberType().range(50, 60)
        })
      });

      model.check({
        a: 'foobar',
        b: 'a',
        c: 40,
        d: { e: ' ', f: 40 }
      });

      expect(model.getCheckResult()).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'b must be a valid email' },
        c: { hasError: true, errorMessage: 'c field must be between 18 and 30' },
        d: {
          hasError: true,
          object: {
            e: { hasError: true, errorMessage: 'e is a required field' },
            f: { hasError: true, errorMessage: 'f field must be between 50 and 60' }
          }
        }
      });

      expect(model.getCheckResult('d')).to.deep.equal({
        hasError: true,
        object: {
          e: { hasError: true, errorMessage: 'e is a required field' },
          f: { hasError: true, errorMessage: 'f field must be between 50 and 60' }
        }
      });

      expect(model.getCheckResult('d.e')).to.deep.equal({
        hasError: true,
        errorMessage: 'e is a required field'
      });
    });

    it('Should return check results for nested array', () => {
      const model = SchemaModel({
        a: StringType().isRequired(),
        b: StringType().isEmail(),
        c: ArrayType()
          .of(
            ObjectType().shape({
              d: StringType().isEmail().isRequired(),
              e: NumberType().range(50, 60)
            })
          )
          .isRequired()
      });

      model.check({
        a: 'foobar',
        b: 'a',
        c: [{}, { d: ' ', e: 40 }]
      });

      expect(model.getCheckResult()).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'b must be a valid email' },
        c: {
          hasError: true,
          array: [
            {
              hasError: true,
              object: {
                d: { hasError: true, errorMessage: 'd is a required field' },
                e: { hasError: false }
              }
            },
            {
              hasError: true,
              object: {
                d: { hasError: true, errorMessage: 'd is a required field' },
                e: { hasError: true, errorMessage: 'e field must be between 50 and 60' }
              }
            }
          ]
        }
      });

      expect(model.getCheckResult('c.0.d')).to.deep.equal({
        hasError: true,
        errorMessage: 'd is a required field'
      });
    });
  });

  describe('## static combine', () => {
    it('Should return a combined model.    ', () => {
      const model1 = SchemaModel({
        username: StringType().isRequired(),
        email: StringType().isEmail()
      });

      const checkResult = model1.check({
        username: 'foobar',
        email: 'foo@bar.com',
        age: 40
      });

      expect(checkResult).to.deep.equal({
        username: { hasError: false },
        email: { hasError: false }
      });

      const model2 = SchemaModel({
        username: StringType().isRequired().minLength(7),
        age: NumberType().range(18, 30)
      });

      const checkResult2 = SchemaModel.combine(model1, model2).check({
        username: 'fooba',
        email: 'foo@bar.com',
        age: 40
      });

      expect(checkResult2).to.deep.equal({
        username: { hasError: true, errorMessage: 'username must be at least 7 characters' },
        email: { hasError: false },
        age: { hasError: true, errorMessage: 'age field must be between 18 and 30' }
      });
    });
  });
});
