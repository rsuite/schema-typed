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
});
