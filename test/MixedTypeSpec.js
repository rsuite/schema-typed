import chai, { expect } from 'chai';
import * as schema from '../src';

chai.should();

const { StringType, SchemaModel, NumberType, ArrayType, MixedType, ObjectType } = schema;

describe('#MixedType', () => {
  describe('addRule', () => {
    it('Should check if two fields are the same by addRule', () => {
      const schema = SchemaModel({
        a: StringType().isRequired(),
        b: StringType()
          .addRule((value, data) => value === data.a, 'The two fields are not the same')
          .isRequired()
      });

      expect(schema.check({ a: '123', b: '123' })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: false }
      });

      expect(schema.check({ a: '123', b: '456' })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'The two fields are not the same' }
      });

      expect(schema.check({ a: '123', b: '' })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'b is a required field' }
      });
    });

    it('Should check if two fields are the same and the filed value is not root', () => {
      const schema = SchemaModel({
        a: StringType().isRequired(),
        b: StringType()
          .addRule(value => value !== 'root', 'The value is root')
          .addRule((value, data) => value === data.a, 'The two fields are not the same')
          .isRequired()
      });

      expect(schema.check({ a: 'root', b: 'root' })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'The value is root' }
      });

      expect(schema.check({ a: '123', b: '456' })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'The two fields are not the same' }
      });
    });
  });

  describe('priority', () => {
    it('Should have the correct priority', () => {
      const schema = SchemaModel({
        name: StringType()
          .isEmail('error1')
          .addRule(() => false, 'error2')
      });

      schema.check({ name: 'a' }).name.hasError.should.equal(true);
      schema.check({ name: 'a' }).name.errorMessage.should.equal('error1');

      const schema2 = SchemaModel({
        name: StringType()
          .isEmail('error1')
          .addRule(() => false, 'error2', true)
      });

      schema2.check({ name: 'a' }).name.hasError.should.equal(true);
      schema2.check({ name: 'a' }).name.errorMessage.should.equal('error2');

      const schema3 = SchemaModel({
        name: StringType().addRule(() => true, 'error2', true)
      });

      schema3.check({ name: 'a' }).name.hasError.should.equal(false);
    });

    it('Should be isRequired with a higher priority than addRule', () => {
      const schema = SchemaModel({
        str: StringType()
          .isRequired('required')
          .addRule(value => value === '', 'error')
      });

      schema.checkForField('str', { str: '' }).hasError.should.equal(true);
      schema.checkForField('str', { str: '' }).errorMessage.should.equal('required');

      schema.checkForField('str', { str: '12' }).hasError.should.equal(true);
      schema.checkForField('str', { str: '12' }).errorMessage.should.equal('error');

      const schema2 = SchemaModel({
        str: StringType().addRule(value => value === '', 'error')
      });

      schema2.checkForField('str', { str: '12' }).hasError.should.equal(true);
      schema2.checkForField('str', { str: '12' }).errorMessage.should.equal('error');
    });
  });

  describe('required', () => {
    it('Should be error for undefined string with isRequired', () => {
      const schema = SchemaModel({
        str: StringType().isRequired('required')
      });

      const result = schema.check({ str: undefined });
      result.str.hasError.should.equal(true);
    });

    it('Should be error for empty string with isRequired', () => {
      const schema = SchemaModel({
        str: StringType().isRequired('required')
      });
      const result = schema.check({ str: '' });
      result.str.hasError.should.equal(true);
    });

    it('Should be error for empty array with isRequired', () => {
      const schema = SchemaModel({
        arr: ArrayType().isRequired('required')
      });
      let obj = {
        arr: []
      };
      let result = schema.check(obj);
      result.arr.hasError.should.equal(true);
    });

    it('Should be without error for empty string with isRequiredOrEmpty', () => {
      const schema = SchemaModel({
        str: StringType().isRequiredOrEmpty('required'),
        str2: StringType().isRequiredOrEmpty()
      });
      let obj = {
        str: '',
        str2: null
      };
      let result = schema.check(obj);

      result.str.hasError.should.equal(false);
      result.str2.hasError.should.equal(true);
      result.str2.errorMessage.should.equal('str2 is a required field');
    });

    it('Should be without error for empty array with isRequiredOrEmpty', () => {
      const schema = SchemaModel({
        arr: ArrayType().isRequiredOrEmpty('required')
      });
      let obj = {
        arr: []
      };
      let result = schema.check(obj);
      result.arr.hasError.should.equal(false);
    });

    it('Should be error for undefined string with isRequiredOrEmpty', () => {
      const schema = SchemaModel({
        str: StringType().isRequiredOrEmpty('required')
      });
      let obj = {
        str: undefined
      };
      let result = schema.check(obj);
      result.str.hasError.should.equal(true);
    });
  });

  describe('async', () => {
    it('Should call async check', done => {
      const schema = SchemaModel({
        email: StringType('error1').isEmail('error2'),
        name: StringType().addRule(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(false);
            }, 1000);
          });
        }, 'error1')
      });

      schema.checkAsync({ name: 'a', email: 'a' }).then(status => {
        if (
          status.name.hasError &&
          status.name.errorMessage === 'error1' &&
          status.email.hasError &&
          status.email.errorMessage === 'error2'
        ) {
          done();
        }
      });
    });

    it('Should call async check', done => {
      const schema = SchemaModel({
        email: StringType('error1').isEmail('error2')
      });

      schema.checkAsync({ name: 'a', email: 'a' }).then(status => {
        if (status.email.hasError && status.email.errorMessage === 'error2') {
          done();
        }
      });
    });

    it('Should call async checkForFieldAsync and verify pass', done => {
      const schema = SchemaModel({
        name: StringType().addRule(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(false);
            }, 500);
          });
        }, 'error1')
      });

      schema.checkForFieldAsync('name', { name: 'a' }).then(status => {
        if (status.hasError && status.errorMessage === 'error1') {
          done();
        }
      });
    });

    it('Should call async checkForFieldAsync and the validation fails', done => {
      const schema = SchemaModel({
        email: StringType('error1').isEmail('error2')
      });

      schema.checkForFieldAsync('email', { email: 'a' }).then(status => {
        if (status.hasError && status.errorMessage === 'error2') {
          done();
        }
      });
    });

    it('Should call async checkForFieldAsync and the validation fails', done => {
      const schema = SchemaModel({
        name: StringType().addRule(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(true);
            }, 200);
          });
        }, 'error1')
      });

      schema.checkForFieldAsync('name', { name: 'a' }).then(status => {
        if (status.hasError === false) {
          done();
        }
      });
    });

    it('Should call async checkForFieldAsync and the validation fails', done => {
      const schema = SchemaModel({
        name: StringType()
          .addRule(() => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(false);
              }, 200);
            });
          }, 'error1')
          .addRule(() => {
            return new Promise(resolve => {
              resolve(false);
            });
          }, 'error2')
      });

      schema.checkForFieldAsync('name', { name: 'a' }).then(status => {
        if (status.hasError && status.errorMessage === 'error1') {
          done();
        }
      });
    });
  });

  describe('when', () => {
    it('Should type be changed by condition', () => {
      const model = SchemaModel({
        field1: NumberType().min(10),
        field2: MixedType().when(schema => {
          const checkResult = schema.field1.check();
          return checkResult.hasError
            ? NumberType().min(10, 'error1')
            : NumberType().min(2, 'error2');
        })
      });

      const checkResult1 = model.check({ field1: 20, field2: 2 });

      expect(checkResult1).to.deep.equal({
        field1: { hasError: false },
        field2: { hasError: false }
      });

      const checkResult2 = model.check({ field1: 1, field2: 1 });

      expect(checkResult2).to.deep.equal({
        field1: { hasError: true, errorMessage: 'field1 must be greater than or equal to 10' },
        field2: { hasError: true, errorMessage: 'error1' }
      });

      const checkResult3 = model.check({ field1: 10, field2: 1 });

      expect(checkResult3).to.deep.equal({
        field1: { hasError: false },
        field2: { hasError: true, errorMessage: 'error2' }
      });

      const checkResult4 = model.checkForField('field2', { field1: 20, field2: 1 });
      checkResult4.errorMessage.should.equal('error2');

      expect(checkResult4).to.deep.equal({ hasError: true, errorMessage: 'error2' });

      const checkResult5 = model.checkForField('field2', { field1: 9, field2: 1 });

      expect(checkResult5).to.deep.equal({ hasError: true, errorMessage: 'error1' });
    });

    it('Should change the type by getting the value of other fields in the schema', () => {
      const model = SchemaModel({
        option: StringType().isOneOf(['a', 'b', 'other']),
        other: StringType().when(schema => {
          const { value } = schema.option;
          return value === 'other' ? StringType().isRequired('Other required') : StringType();
        })
      });

      const checkResult = model.check({ option: 'a', other: '' });

      expect(checkResult).to.deep.equal({
        option: { hasError: false },
        other: { hasError: false }
      });

      const checkResult2 = model.check({ option: 'other', other: '' });

      expect(checkResult2).to.deep.equal({
        option: { hasError: false },
        other: { hasError: true, errorMessage: 'Other required' }
      });
    });

    it('Should change the type by verifying the value of other fields in the schema', () => {
      const model = SchemaModel({
        password: StringType().isRequired('Password required'),
        confirmPassword: StringType().when(schema => {
          const { hasError } = schema.password.check();
          return hasError
            ? StringType()
            : StringType()
                .addRule(
                  value => value === schema.password.value,
                  'The passwords are inconsistent twice'
                )
                .isRequired()
                .label('Confirm password');
        })
      });

      const checkResult = model.check({ password: '', confirmPassword: '123' });

      expect(checkResult).to.deep.equal({
        password: { hasError: true, errorMessage: 'Password required' },
        confirmPassword: { hasError: false }
      });

      const checkResult2 = model.check({ password: '123', confirmPassword: '123' });

      expect(checkResult2).to.deep.equal({
        password: { hasError: false },
        confirmPassword: { hasError: false }
      });

      const checkResult3 = model.check({ password: '123', confirmPassword: '1234' });

      expect(checkResult3).to.deep.equal({
        password: { hasError: false },
        confirmPassword: { hasError: true, errorMessage: 'The passwords are inconsistent twice' }
      });

      const checkResult4 = model.check({ password: '123', confirmPassword: '' });

      expect(checkResult4).to.deep.equal({
        password: { hasError: false },
        confirmPassword: { hasError: true, errorMessage: 'Confirm password is a required field' }
      });
    });
  });

  describe('proxy - checkForField', () => {
    it('Should verify the dependent field through proxy', () => {
      const schema = SchemaModel({
        password: StringType().isRequired().proxy(['confirmPassword']),
        confirmPassword: StringType()
          .isRequired()
          .addRule((value, data) => {
            if (value !== data?.password) {
              return false;
            }
            return true;
          }, 'The passwords are inconsistent twice')
      });

      expect(
        schema.checkForField('password', { password: '123', confirmPassword: '13' })
      ).to.deep.equal({ hasError: false });

      expect(schema.getState()).to.deep.equal({
        password: { hasError: false },
        confirmPassword: {
          hasError: true,
          errorMessage: 'The passwords are inconsistent twice'
        }
      });

      expect(schema.check({ password: '123', confirmPassword: '13' })).to.deep.equal({
        password: { hasError: false },
        confirmPassword: { hasError: true, errorMessage: 'The passwords are inconsistent twice' }
      });

      expect(schema.check({ password: '123', confirmPassword: '123' })).to.deep.equal({
        password: { hasError: false },
        confirmPassword: { hasError: false }
      });

      expect(schema.getState()).to.deep.equal({
        password: { hasError: false },
        confirmPassword: { hasError: false }
      });
    });

    it('Should not verify the dependent field when field validation fails', () => {
      const schema = SchemaModel({
        a: StringType().isRequired().proxy(['b']),
        b: StringType().isRequired()
      });

      expect(schema.checkForField('a', { a: '' })).to.deep.equal({
        hasError: true,
        errorMessage: 'a is a required field'
      });

      expect(schema.getState()).to.deep.equal({
        a: { hasError: true, errorMessage: 'a is a required field' }
      });
    });

    it('Should verify the dependent field through proxy with nestedObject', () => {
      const schema = SchemaModel({
        a: StringType().isRequired().proxy(['b.c']),
        b: ObjectType().shape({
          c: StringType().isRequired()
        })
      });

      expect(schema.checkForField('a', { a: 'd' }, { nestedObject: true })).to.deep.equal({
        hasError: false
      });

      expect(schema.getState()).to.deep.equal({
        a: { hasError: false },
        b: { object: { c: { hasError: true, errorMessage: 'b.c is a required field' } } }
      });
    });

    it('Should not verify the dependent field when field validation fails', () => {
      const schema = SchemaModel({
        a: StringType().isRequired().proxy(['b', 'd']),
        b: StringType().isRequired(),
        c: StringType().isRequired(),
        d: StringType().isRequired()
      });

      expect(schema.checkForField('a', { a: 'a' })).to.deep.equal({
        hasError: false
      });

      expect(schema.getState()).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'b is a required field' },
        d: { hasError: true, errorMessage: 'd is a required field' }
      });
    });

    it('Should verify the dependent field through proxy with checkIfValueExists', () => {
      const schema = SchemaModel({
        a: StringType().isRequired().proxy(['b'], { checkIfValueExists: true }),
        b: StringType().isRequired()
      });

      expect(schema.checkForField('a', { a: 'a' })).to.deep.equal({
        hasError: false
      });

      expect(schema.getState()).to.deep.equal({ a: { hasError: false } });

      expect(schema.checkForField('a', { a: 'a', b: 1 })).to.deep.equal({
        hasError: false
      });

      expect(schema.getState()).to.deep.equal({
        a: { hasError: false },
        b: {
          hasError: true,
          errorMessage: 'b must be a string'
        }
      });
    });
  });

  describe('proxy - checkForFieldAsync', () => {
    it('Should verify the dependent field through proxy', async () => {
      const schema = SchemaModel({
        password: StringType().isRequired().proxy(['confirmPassword']),
        confirmPassword: StringType()
          .isRequired()
          .addRule((value, data) => {
            if (value !== data?.password) {
              return false;
            }
            return true;
          }, 'The passwords are inconsistent twice')
      });

      await schema
        .checkForFieldAsync('password', { password: '123', confirmPassword: '12' })
        .then(result => {
          expect(result).to.deep.equal({ hasError: false });

          return result;
        });

      expect(schema.getState()).to.deep.equal({
        password: { hasError: false },
        confirmPassword: {
          hasError: true,
          errorMessage: 'The passwords are inconsistent twice'
        }
      });

      await schema.checkAsync({ password: '123', confirmPassword: '13' }).then(result => {
        expect(result).to.deep.equal({
          password: { hasError: false },
          confirmPassword: { hasError: true, errorMessage: 'The passwords are inconsistent twice' }
        });
      });

      await schema.checkAsync({ password: '123', confirmPassword: '123' }).then(result => {
        expect(result).to.deep.equal({
          password: { hasError: false },
          confirmPassword: { hasError: false }
        });
      });

      expect(schema.getState()).to.deep.equal({
        password: { hasError: false },
        confirmPassword: { hasError: false }
      });
    });

    it('Should not verify the dependent field when field validation fails', async () => {
      const schema = SchemaModel({
        a: StringType().isRequired().proxy(['b']),
        b: StringType().isRequired()
      });

      await schema.checkForFieldAsync('a', { a: '' }).then(result => {
        expect(result).to.deep.equal({
          hasError: true,
          errorMessage: 'a is a required field'
        });
      });

      expect(schema.getState()).to.deep.equal({
        a: { hasError: true, errorMessage: 'a is a required field' }
      });
    });

    it('Should verify the dependent field through proxy with nestedObject', async () => {
      const schema = SchemaModel({
        a: StringType().isRequired().proxy(['b.c']),
        b: ObjectType().shape({
          c: StringType().isRequired()
        })
      });

      await schema.checkForFieldAsync('a', { a: 'd' }, { nestedObject: true }).then(result => {
        expect(result).to.deep.equal({
          hasError: false
        });
      });

      expect(schema.getState()).to.deep.equal({
        a: { hasError: false },
        b: { object: { c: { hasError: true, errorMessage: 'b.c is a required field' } } }
      });
    });

    it('Should not verify the dependent field when field validation fails', async () => {
      const schema = SchemaModel({
        a: StringType().isRequired().proxy(['b', 'd']),
        b: StringType().isRequired(),
        c: StringType().isRequired(),
        d: StringType().isRequired()
      });

      await schema.checkForFieldAsync('a', { a: 'a' }).then(result => {
        expect(result).to.deep.equal({ hasError: false });
      });

      expect(schema.getState()).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'b is a required field' },
        d: { hasError: true, errorMessage: 'd is a required field' }
      });
    });

    it('Should verify the dependent field through proxy with checkIfValueExists', async () => {
      const schema = SchemaModel({
        a: StringType().isRequired().proxy(['b'], { checkIfValueExists: true }),
        b: StringType().isRequired()
      });

      await schema.checkForFieldAsync('a', { a: 'a' }).then(result => {
        expect(result).to.deep.equal({ hasError: false });
      });

      expect(schema.getState()).to.deep.equal({ a: { hasError: false } });

      await schema.checkForFieldAsync('a', { a: 'a', b: 1 }).then(result => {
        expect(result).to.deep.equal({ hasError: false });
      });

      expect(schema.getState()).to.deep.equal({
        a: { hasError: false },
        b: {
          hasError: true,
          errorMessage: 'b must be a string'
        }
      });
    });
  });

  it('Should check the wrong verification object', () => {
    const schema = SchemaModel({
      name: StringType()
        .isRequired('This field is required.')
        .addRule(() => ({
          hasError: false,
          errorMessage: 'No Error'
        }))
        .addRule(() => ({
          hasError: true,
          errorMessage: 'Error!!'
        }))
    });

    const checkResult = schema.checkForField('name', { name: 'a' });
    checkResult.hasError.should.equal(true);
    checkResult.errorMessage.should.equal('Error!!');
  });

  it('Should check the wrong verification object by Async', done => {
    const schema = SchemaModel({
      name: StringType()
        .isRequired('This field is required.')
        .addRule(() => ({
          hasError: false,
          errorMessage: 'No Error'
        }))
        .addRule(() => ({
          hasError: true,
          errorMessage: 'Error!!'
        }))
    });

    schema.checkForFieldAsync('name', { name: 'a' }).then(checkResult => {
      if (checkResult.hasError && checkResult.errorMessage === 'Error!!') {
        done();
      }
    });
  });

  it('Should be able to check by `check` ', () => {
    const type = MixedType()
      .addRule(v => {
        if (typeof v === 'number') {
          return true;
        }

        return false;
      }, 'error1')
      .isRequired('error2');

    type.check('').hasError.should.equal(true);
    type.check('').errorMessage.should.equal('error2');
    type.check('1').hasError.should.equal(true);
    type.check('1').errorMessage.should.equal('error1');
    type.check(1).hasError.should.equal(false);
  });

  it('Should be able to check by `checkAsync` ', done => {
    const type = MixedType()
      .addRule(v => {
        return new Promise(resolve => {
          setTimeout(() => {
            if (typeof v === 'number') {
              resolve(true);
            } else {
              resolve(false);
            }
          }, 500);
        });
      }, 'error1')
      .isRequired('error2');

    Promise.all([type.checkAsync(''), type.checkAsync('1'), type.checkAsync(1)]).then(res => {
      if (res[0].hasError && res[1].hasError && !res[2].hasError) {
        done();
      }
    });
  });

  it('should error when an async rule is executed by the sync validator', () => {
    const m = MixedType().addRule(async () => {
      return true;
    }, 'An async error');
    let err;
    try {
      m.check({});
    } catch (e) {
      err = e;
    }
    chai
      .expect(err?.message)
      .to.eql('synchronous validator had an async result, you should probably call "checkAsync()"');
  });
  it('Should be able to check by `checkAsync` with `addAsyncRule`', done => {
    const type = MixedType()
      .addAsyncRule(v => {
        return new Promise(resolve => {
          setTimeout(() => {
            if (typeof v === 'number') {
              resolve(true);
            } else {
              resolve(false);
            }
          }, 500);
        });
      }, 'error1')
      .isRequired('error2');

    Promise.all([type.checkAsync(''), type.checkAsync('1'), type.checkAsync(1)]).then(res => {
      if (res[0].hasError && res[1].hasError && !res[2].hasError) {
        done();
      }
    });
  });
  it('Should be able to check by `check` with `addAsyncRule` and skip the async ', done => {
    let called = false;
    const type = MixedType()
      .addRule(v => {
        return typeof v === 'number';
      }, 'This is not async')
      .addAsyncRule(async () => {
        called = true;
        return false;
      }, 'error1')
      .isRequired('error2');
    setTimeout(() => {
      try {
        expect(called).to.eq(false);
        expect(type.check('').hasError).to.eq(true);
        expect(type.check('1').hasError).to.eq(true);
        expect(type.check(1).hasError).to.eq(false);

        done();
      } catch (e) {
        done(e);
      }
    }, 100);
  });

  describe('equalTo', () => {
    it('Should check if two fields are the same by equalTo', () => {
      const schema = SchemaModel({
        a: StringType().isRequired(),
        b: StringType().equalTo('a').isRequired()
      });

      expect(schema.check({ a: '123', b: '123' })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: false }
      });

      expect(schema.check({ a: '123', b: '456' })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'b must be the same as a' }
      });

      expect(schema.check({ a: '123', b: '' })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'b is a required field' }
      });
    });

    it('Should check if two fields are the same with custom message', () => {
      const schema = SchemaModel({
        a: StringType().isRequired(),
        b: StringType().equalTo('a', 'The two fields are not the same').isRequired()
      });

      expect(schema.check({ a: '123', b: '456' })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'The two fields are not the same' }
      });
    });

    it('Should check if two fields are the same when the field is an object', () => {
      const schema = SchemaModel({
        a: ObjectType(),
        b: ObjectType().equalTo('a'),
        c: ArrayType(),
        d: ArrayType().equalTo('c')
      });

      expect(schema.check({ a: { A: '1' }, b: { A: '2' } })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'b must be the same as a' },
        c: { hasError: false },
        d: { hasError: false }
      });

      expect(schema.check({ a: { A: '1' }, b: { A: '1' } })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: false },
        c: { hasError: false },
        d: { hasError: false }
      });

      expect(schema.check({ c: [1, 2, 3], d: [4, 5, 6] })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: false },
        c: { hasError: false },
        d: { hasError: true, errorMessage: 'd must be the same as c' }
      });

      expect(schema.check({ c: [1, 2, 3], d: [1, 2, 3] })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: false },
        c: { hasError: false },
        d: { hasError: false }
      });
    });

    it('Should check if two fields are the same when the field is a nested object', () => {
      const schema = SchemaModel({
        a: ObjectType().shape({
          a1: StringType(),
          a2: StringType().equalTo('a1')
        }),
        c: StringType().equalTo('a.a2').isRequired()
      });

      expect(schema.check({ a: { a1: '1', a2: '1' }, c: '1' })).to.deep.equal({
        a: {
          hasError: false,
          object: { a1: { hasError: false }, a2: { hasError: false } }
        },
        c: { hasError: false }
      });

      expect(schema.check({ a: { a1: '1', a2: '2' }, c: '2' })).to.deep.equal({
        a: {
          hasError: true,
          object: {
            a1: { hasError: false },
            a2: { hasError: true, errorMessage: 'a2 must be the same as a1' }
          }
        },
        c: { hasError: false }
      });

      expect(schema.check({ a: { a1: '1', a2: '1' }, c: '2' })).to.deep.equal({
        a: {
          hasError: false,
          object: { a1: { hasError: false }, a2: { hasError: false } }
        },
        c: { hasError: true, errorMessage: 'c must be the same as a.a2' }
      });
    });
  });

  describe('label', () => {
    it('Should use label to override the field name in the error message', () => {
      const schema = SchemaModel({
        first_name: StringType().label('First Name').isRequired(),
        age: NumberType().label('Age').isRequired().range(18, 60)
      });

      expect(schema.check({})).to.deep.equal({
        first_name: { hasError: true, errorMessage: 'First Name is a required field' },
        age: { hasError: true, errorMessage: 'Age is a required field' }
      });

      expect(schema.checkForField('age', { first_name: 'a', age: 5 })).to.deep.equal({
        hasError: true,
        errorMessage: 'Age field must be between 18 and 60'
      });
    });

    it('Should use label to override the field name in the error message when the field is an object', () => {
      const schema = SchemaModel({
        user: ObjectType().shape({
          first_name: StringType().label('First Name').isRequired(),
          age: NumberType().label('Age').isRequired().isRequired().range(18, 60)
        })
      });

      expect(schema.check({ user: {} })).to.deep.equal({
        user: {
          hasError: true,
          object: {
            first_name: { hasError: true, errorMessage: 'First Name is a required field' },
            age: { hasError: true, errorMessage: 'Age is a required field' }
          }
        }
      });

      expect(schema.checkForField('user', { user: { first_name: 'a', age: 5 } })).to.deep.equal({
        hasError: true,
        object: {
          first_name: { hasError: false },
          age: { hasError: true, errorMessage: 'Age field must be between 18 and 60' }
        }
      });
    });

    it('Should check if two fields are the same by equalTo', () => {
      const schema = SchemaModel({
        a: StringType().isRequired().label('A'),
        b: StringType().equalTo('a').isRequired().label('B')
      });

      expect(schema.check({ a: '123', b: '456' })).to.deep.equal({
        a: { hasError: false },
        b: { hasError: true, errorMessage: 'B must be the same as A' }
      });
    });

    describe('label - async', () => {
      it('Should use label to override the field name in the error message', async () => {
        const schema = SchemaModel({
          first_name: StringType().label('First Name').isRequired(),
          age: NumberType().label('Age').isRequired().range(18, 60)
        });

        await schema.checkAsync({}).then(result => {
          expect(result).to.deep.equal({
            first_name: { hasError: true, errorMessage: 'First Name is a required field' },
            age: { hasError: true, errorMessage: 'Age is a required field' }
          });
        });

        await schema.checkForFieldAsync('age', { first_name: 'a', age: 5 }).then(result => {
          expect(result).to.deep.equal({
            hasError: true,
            errorMessage: 'Age field must be between 18 and 60'
          });
        });
      });

      it('Should use label to override the field name in the error message when the field is an object', async () => {
        const schema = SchemaModel({
          user: ObjectType().shape({
            first_name: StringType().label('First Name').isRequired(),
            age: NumberType().label('Age').isRequired().isRequired().range(18, 60)
          })
        });

        await schema.checkAsync({ user: {} }).then(result => {
          expect(result).to.deep.equal({
            user: {
              hasError: true,
              object: {
                first_name: { hasError: true, errorMessage: 'First Name is a required field' },
                age: { hasError: true, errorMessage: 'Age is a required field' }
              }
            }
          });
        });

        await schema
          .checkForFieldAsync('user', { user: { first_name: 'a', age: 5 } })
          .then(result => {
            expect(result).to.deep.equal({
              hasError: true,
              object: {
                first_name: { hasError: false },
                age: { hasError: true, errorMessage: 'Age field must be between 18 and 60' }
              }
            });
          });
      });

      it('Should check if two fields are the same by equalTo', async () => {
        const schema = SchemaModel({
          a: StringType().isRequired().label('A'),
          b: StringType().equalTo('a').isRequired().label('B')
        });

        await schema.checkAsync({ a: '123', b: '456' }).then(result => {
          expect(result).to.deep.equal({
            a: { hasError: false },
            b: { hasError: true, errorMessage: 'B must be the same as A' }
          });
        });
      });
    });
  });
});
