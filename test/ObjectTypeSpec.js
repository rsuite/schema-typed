import { expect } from 'chai';
import { flaser } from 'object-flaser';
import * as schema from '../src';

const { ObjectType, StringType, NumberType, Schema } = schema;

describe('#ObjectType', () => {
  it('Should be a valid object', () => {
    const schemaData = {
      url: StringType().isURL('Should be a url'),
      user: ObjectType().shape({
        email: StringType().isEmail('Should be an email'),
        age: NumberType().min(18, 'Age should be greater than 18')
      })
    };

    const schema = new Schema(schemaData);

    const checkResult = schema.checkForField('user', {
      user: { email: 'simon.guo@hypers.com', age: 19 }
    });

    expect(checkResult).to.deep.equal({
      hasError: false,
      object: {
        email: { hasError: false },
        age: { hasError: false }
      }
    });

    const checkResult2 = schema.checkForField('user', { user: { email: 'simon.guo', age: 19 } });

    expect(checkResult2).to.deep.equal({
      hasError: true,
      object: {
        email: { hasError: true, errorMessage: 'Should be an email' },
        age: { hasError: false }
      }
    });

    const checkResult3 = schema.checkForField('user', {
      user: {
        email: 'simon.guo@hypers.com',
        age: 17
      }
    });

    expect(checkResult3).to.deep.equal({
      hasError: true,
      object: {
        email: { hasError: false },
        age: { hasError: true, errorMessage: 'Age should be greater than 18' }
      }
    });
  });

  it('Should be checked for object nesting.', () => {
    const schemaData = {
      url: StringType().isURL('Should be a url'),
      user: ObjectType().shape({
        email: StringType().isEmail('Should be an email'),
        age: NumberType().min(18, 'Age should be greater than 18'),
        parent: ObjectType().shape({
          email: StringType().isEmail('Should be an email'),
          age: NumberType().min(50, 'Age should be greater than 50')
        })
      })
    };

    const schema = new Schema(schemaData);

    const checkResult = schema.checkForField('user', {
      user: {
        email: 'simon.guo@hypers.com',
        age: 17,
        parent: { email: 'zicheng', age: 40 }
      }
    });

    expect(checkResult).to.deep.equal({
      hasError: true,
      object: {
        email: { hasError: false },
        age: { hasError: true, errorMessage: 'Age should be greater than 18' },
        parent: {
          hasError: true,
          object: {
            email: { hasError: true, errorMessage: 'Should be an email' },
            age: { hasError: true, errorMessage: 'Age should be greater than 50' }
          }
        }
      }
    });

    const checkResult2 = schema.checkForField('user', {
      user: {
        email: 'simon.guo@hypers.com',
        age: 18,
        parent: { email: 'zicheng@dd.com', age: 50 }
      }
    });

    expect(checkResult2).to.deep.equal({
      hasError: false,
      object: {
        email: { hasError: false },
        age: { hasError: false },
        parent: {
          hasError: false,
          object: {
            email: { hasError: false },
            age: { hasError: false }
          }
        }
      }
    });
  });

  it('Should be a valid object by flaser', () => {
    const schemaData = {
      'data.email': StringType().isEmail('Should be an email'),
      'data.age': NumberType().min(18, 'Should be greater than 18')
    };

    const data = {
      data: { email: 'simon.guo@hypers.com', age: 17 }
    };

    const schema = new Schema(schemaData);
    const checkResult = schema.check(flaser(data));

    expect(checkResult).to.deep.equal({
      'data.email': { hasError: false },
      'data.age': { hasError: true, errorMessage: 'Should be greater than 18' }
    });
  });

  it('Should aync check for object nesting', async () => {
    const schema = new Schema({
      url: StringType().isURL('Should be a url'),
      user: ObjectType().shape({
        email: StringType().addRule(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve(false), 400);
          });
        }, 'Should be an email'),
        age: NumberType().min(18, 'Should be greater than 18')
      })
    });

    const result = await schema.checkAsync({ url: 'url', user: { email: 'a', age: '10' } });

    expect(result).to.deep.equal({
      url: { hasError: true, errorMessage: 'Should be a url' },
      user: {
        hasError: true,
        object: {
          email: { hasError: true, errorMessage: 'Should be an email' },
          age: { hasError: true, errorMessage: 'Should be greater than 18' }
        }
      }
    });
  });

  it('Should be checked for object nesting with nestedObject option.', () => {
    const schema = new Schema({
      url: StringType().isURL('Should be a url'),
      user: ObjectType().shape({
        email: StringType().isEmail('Should be an email'),
        age: NumberType().min(18, 'Age should be greater than 18'),
        parent: ObjectType().shape({
          email: StringType().isEmail('Should be an email').isRequired('Email is required'),
          age: NumberType().min(50, 'Age should be greater than 50')
        })
      })
    });
    const options = { nestedObject: true };

    const checkResult = schema.checkForField(
      'user.parent.age',
      { user: { parent: { age: 40 } } },
      options
    );

    expect(checkResult).to.deep.equal({
      hasError: true,
      errorMessage: 'Age should be greater than 50'
    });

    expect(schema.getCheckResult()).to.deep.equal({
      user: {
        object: {
          parent: {
            object: { age: { hasError: true, errorMessage: 'Age should be greater than 50' } }
          }
        }
      }
    });

    const checkResult2 = schema.checkForField(
      'user.parent.age',
      { user: { parent: { age: 60 } } },
      options
    );

    expect(checkResult2).to.deep.equal({ hasError: false });

    expect(schema.getCheckResult()).to.deep.equal({
      user: { object: { parent: { object: { age: { hasError: false } } } } }
    });

    const checkResult3 = schema.checkForField(
      'user.parent.email',
      { user: { parent: { age: 60 } } },
      options
    );

    expect(checkResult3).to.deep.equal({ hasError: true, errorMessage: 'Email is required' });

    expect(schema.getCheckResult()).to.deep.equal({
      user: {
        object: {
          parent: {
            object: {
              age: { hasError: false },
              email: { hasError: true, errorMessage: 'Email is required' }
            }
          }
        }
      }
    });
  });

  it('Should aync check for object nesting', async () => {
    const schema = new Schema({
      url: StringType().isURL('Should be a url'),
      user: ObjectType().shape({
        email: StringType().isEmail('Should be an email'),
        age: NumberType().min(18, 'Should be greater than 18'),
        parent: ObjectType().shape({
          email: StringType().addRule(value => {
            return new Promise(resolve => {
              setTimeout(() => {
                if (/@/.test(value)) {
                  resolve(true);
                }
                resolve(false);
              }, 400);
            });
          }, 'Should be an email'),
          age: NumberType().min(50, 'Age should be greater than 50')
        })
      })
    });

    const options = { nestedObject: true };

    const result = await schema.checkForFieldAsync(
      'user.parent.email',
      { user: { parent: { email: 'a' } } },
      options
    );

    expect(result).to.deep.equal({ hasError: true, errorMessage: 'Should be an email' });

    const result2 = await schema.checkForFieldAsync(
      'user.parent.email',
      { user: { parent: { email: 'a@a.com' } } },
      options
    );

    expect(result2).to.deep.equal({ hasError: false });
  });

  it('Should not allow empty object', () => {
    const schema = new Schema({
      user: ObjectType().isRequired('User is required')
    });

    const result = schema.check({ user: null });
    expect(result).to.deep.equal({ user: { hasError: true, errorMessage: 'User is required' } });

    const result2 = schema.check({ user: undefined });
    expect(result2).to.deep.equal({ user: { hasError: true, errorMessage: 'User is required' } });

    const result3 = schema.check({ user: false });
    expect(result3).to.deep.equal({
      user: { hasError: true, errorMessage: 'user must be an object' }
    });
  });

  it('Should not allow empty object by async', async () => {
    const schema = new Schema({
      user: ObjectType().isRequired('User is required')
    });

    const result = await schema.checkAsync({ user: null });
    expect(result).to.deep.equal({ user: { hasError: true, errorMessage: 'User is required' } });

    const result2 = await schema.checkAsync({ user: undefined });
    expect(result2).to.deep.equal({ user: { hasError: true, errorMessage: 'User is required' } });

    const result3 = await schema.checkAsync({ user: false });
    expect(result3).to.deep.equal({
      user: { hasError: true, errorMessage: 'user must be an object' }
    });
  });

  it('Should allow empty object', () => {
    const schema = new Schema({
      user: ObjectType()
    });

    const result = schema.check({ user: null });
    expect(result).to.deep.equal({ user: { hasError: false } });
  });

  it('Should allow empty object by async', async () => {
    const schema = new Schema({
      user: ObjectType()
    });

    const result = await schema.checkAsync({ user: null });
    expect(result).to.deep.equal({ user: { hasError: false } });
  });

  it('Should replace default required message', () => {
    const schema = new Schema({
      user: ObjectType().shape({
        email: StringType().isEmail().isRequired('Email is required')
      })
    });

    const result = schema.check({ user: { email: '' } });

    expect(result.user.object.email.errorMessage).to.equal('Email is required');
  });

  it('Should replace default required message with async', async () => {
    const schema = new Schema({
      user: ObjectType().shape({
        email: StringType().isEmail().isRequired('Email is required')
      })
    });

    const result = await schema.checkAsync({ user: { email: '' } });

    expect(result.user.object.email.errorMessage).to.equal('Email is required');
  });
});
