const should = require('chai').should();
const schema = require('../src');
const { StringType, SchemaModel } = schema;

describe('#Type', () => {
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
        .addRule((value, data) => value !== 'root', 'Password cannot be root')
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

    schema.checkForField('str', '').hasError.should.equal(true);
    schema.checkForField('str', '').errorMessage.should.equal('required');

    schema.checkForField('str', '12').hasError.should.equal(true);
    schema.checkForField('str', '12').errorMessage.should.equal('error');

    const schema2 = SchemaModel({
      str: StringType().addRule(value => value === '', 'error')
    });

    schema2.checkForField('str', '12').hasError.should.equal(true);
    schema2.checkForField('str', '12').errorMessage.should.equal('error');
  });

  it('Should call asynchronous check', done => {
    const schema = SchemaModel({
      email: StringType('error1').isEmail('error2'),
      name: StringType().addRule((value, data) => {
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

  it('Should call asynchronous check', done => {
    const schema = SchemaModel({
      email: StringType('error1').isEmail('error2')
    });

    schema.checkAsync({ name: 'a', email: 'a' }).then(status => {
      if (status.email.hasError && status.email.errorMessage === 'error2') {
        done();
      }
    });
  });

  it('Should call asynchronous checkForFieldAsync and verify pass', done => {
    const schema = SchemaModel({
      name: StringType().addRule((value, data) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
      }, 'error1')
    });

    schema.checkForFieldAsync('name', 'a').then(status => {
      if (status.hasError && status.errorMessage === 'error1') {
        done();
      }
    });
  });

  it('Should call asynchronous checkForFieldAsync and the validation fails', done => {
    const schema = SchemaModel({
      email: StringType('error1').isEmail('error2')
    });

    schema.checkForFieldAsync('email', 'a').then(status => {
      if (status.hasError && status.errorMessage === 'error2') {
        done();
      }
    });
  });

  it('Should call asynchronous checkForFieldAsync and the validation fails', done => {
    const schema = SchemaModel({
      name: StringType().addRule((value, data) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(true);
          }, 200);
        });
      }, 'error1')
    });

    schema.checkForFieldAsync('name', 'a').then(status => {
      if (status.hasError === false) {
        done();
      }
    });
  });

  it('Should call asynchronous checkForFieldAsync and the validation fails', done => {
    const schema = SchemaModel({
      name: StringType()
        .addRule((value, data) => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(false);
            }, 200);
          });
        }, 'error1')
        .addRule((value, data) => {
          return new Promise(resolve => {
            resolve(false);
          });
        }, 'error2')
    });

    schema.checkForFieldAsync('name', 'a').then(status => {
      if (status.hasError && status.errorMessage === 'error1') {
        done();
      }
    });
  });
});
