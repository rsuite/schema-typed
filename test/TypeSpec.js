const should = require('chai').should();
const schema = require('../src');
const { StringType, SchemaModel } = schema;

describe('#Type', () => {
  it('Testing the custom validation rule', () => {
    const schema = SchemaModel({
      password1: StringType().isRequired('Password is required'),
      password2: StringType().addRule((value, data) => {
        if (value !== data.password1) {
          return false;
        }
        return true;
      }, 'The two passwords do not match')
    });

    schema
      .check({ password1: '123456', password2: '123456' })
      .password2.hasError.should.equal(false);
    schema
      .check({ password1: '123456', password2: 'abcdedf' })
      .password2.hasError.should.equal(true);
  });
});
