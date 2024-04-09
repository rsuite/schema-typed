import chai, { expect } from 'chai';
import * as schema from '../src';

chai.should();

const { StringType, SchemaModel, NumberType, ArrayType, MixedType } = schema;

describe('#MixedType', () => {
  it('Should be the same password twice', () => {
    const schema = SchemaModel({
      password1: StringType().isRequired('Password is required'),
      password2: StringType()
        .addRule((value, data) => value === data.password1, 'The two passwords do not match')
        .isRequired('Password is required')
    });

    schema
      .check({ password1: '123456', password2: '123456' })
      .password2.hasError.should.equal(false);
    schema
      .check({ password1: '123456', password2: 'abcdedf' })
      .password2.hasError.should.equal(true);

    schema.check({ password1: '123456', password2: '' }).password2.hasError.should.equal(true);
  });

  it('Should be the same password twice and the password cannot be `root`', () => {
    const schema = SchemaModel({
      password1: StringType().isRequired('Password is required'),
      password2: StringType()
        .addRule(value => value !== 'root', 'Password cannot be root')
        .addRule((value, data) => value === data.password1, 'The two passwords do not match')
        .isRequired('Password is required')
    });

    schema.check({ password1: 'root', password2: 'root' }).password2.hasError.should.equal(true);
    schema
      .check({ password1: 'root', password2: 'root' })
      .password2.errorMessage.should.equal('Password cannot be root');

    schema
      .check({ password1: '123456', password2: '' })
      .password2.errorMessage.should.equal('Password is required');
    schema
      .check({ password1: '123456', password2: '123' })
      .password2.errorMessage.should.equal('The two passwords do not match');
  });

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

  it('Should be error for undefined string with isRequired', () => {
    const schema = SchemaModel({
      str: StringType().isRequired('required')
    });
    let obj = {
      str: undefined
    };
    let result = schema.check(obj);
    result.str.hasError.should.equal(true);
  });

  it('Should be error for empty string with isRequired', () => {
    const schema = SchemaModel({
      str: StringType().isRequired('required')
    });
    let obj = {
      str: ''
    };
    let result = schema.check(obj);
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

  it('Should type be changed by condition', () => {
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

  it('Should type be changed by condition', () => {
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

  it('Should use label to override the field name in the error message', () => {
    const schema = SchemaModel({
      first_name: StringType().label('First Name').isRequired(),
      age: NumberType().label('Age').isRequired()
    });

    expect(schema.check({})).to.deep.equal({
      first_name: { hasError: true, errorMessage: 'First Name is a required field' },
      age: { hasError: true, errorMessage: 'Age is a required field' }
    });
  });
});
