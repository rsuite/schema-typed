import { flaser } from 'object-flaser';

/* eslint-disable @typescript-eslint/no-var-requires */
require('chai').should();

const schema = require('../src');
const { ObjectType, StringType, NumberType, Schema } = schema;

describe('#ObjectType', () => {
  it('Should be a valid object', () => {
    let schemaData = {
      url: StringType().isURL('应该是一个 url'),
      user: ObjectType().shape({
        email: StringType().isEmail('应该是一个 email'),
        age: NumberType().min(18, '年龄应该大于18岁')
      })
    };

    let schema = new Schema(schemaData);

    schema
      .checkForField('user', { user: { email: 'simon.guo@hypers.com', age: 19 } })
      .object.email.hasError.should.equal(false);
    schema
      .checkForField('user', { user: { email: 'simon.guo', age: 19 } })
      .object.email.hasError.should.equal(true);

    let checkStatus = schema.checkForField('user', {
      user: {
        email: 'simon.guo@hypers.com',
        age: 17
      }
    });

    checkStatus.object.age.hasError.should.equal(true);
    checkStatus.object.age.errorMessage.should.equal('年龄应该大于18岁');
  });

  it('Should be checked for object nesting.', () => {
    const schemaData = {
      url: StringType().isURL('应该是一个 url'),
      user: ObjectType().shape({
        email: StringType().isEmail('应该是一个 email'),
        age: NumberType().min(18, '年龄应该大于18岁'),
        parent: ObjectType().shape({
          email: StringType().isEmail('应该是一个邮箱'),
          age: NumberType().min(50, '年龄应该大于50岁')
        })
      })
    };

    const schema = new Schema(schemaData);

    const checkStatus = schema.checkForField('user', {
      user: {
        email: 'simon.guo@hypers.com',
        age: 17,
        parent: { email: 'zicheng', age: 40 }
      }
    });

    checkStatus.hasError.should.equal(true);
    checkStatus.object.email.hasError.should.equal(false);
    checkStatus.object.age.hasError.should.equal(true);
    checkStatus.object.age.errorMessage.should.equal('年龄应该大于18岁');
    checkStatus.object.parent.hasError.should.equal(true);

    const parentCheckStatus = checkStatus.object.parent.object;

    parentCheckStatus.email.hasError.should.equal(true);
    parentCheckStatus.email.errorMessage.should.equal('应该是一个邮箱');
    parentCheckStatus.age.hasError.should.equal(true);
    parentCheckStatus.age.errorMessage.should.equal('年龄应该大于50岁');

    const checkStatus2 = schema.checkForField('user', {
      user: {
        email: 'simon.guo@hypers.com',
        age: 18,
        parent: { email: 'zicheng@dd.com', age: 50 }
      }
    });

    checkStatus2.hasError.should.equal(false);
    checkStatus2.object.age.hasError.should.equal(false);
    checkStatus2.object.age.hasError.should.equal(false);
    checkStatus2.object.parent.hasError.should.equal(false);
    const parentCheckStatus2 = checkStatus2.object.parent.object;
    parentCheckStatus2.email.hasError.should.equal(false);
    parentCheckStatus2.age.hasError.should.equal(false);
  });

  it('Should be a valid object by flaser', () => {
    const schemaData = {
      'data.email': StringType().isEmail('error1'),
      'data.age': NumberType().min(18, 'error1')
    };

    const data = {
      data: { email: 'simon.guo@hypers.com', age: 17 }
    };

    const schema = new Schema(schemaData);
    const checkStatus = schema.check(flaser(data));

    checkStatus['data.email'].hasError.should.equal(false);
    checkStatus['data.age'].hasError.should.equal(true);
  });

  it('Should call async check', done => {
    const schema = new Schema({
      url: StringType().isURL('error1'),
      user: ObjectType().shape({
        email: StringType().addRule((value, data) => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(false);
            }, 1000);
          });
        }, 'error1'),
        age: NumberType().min(18, 'error2')
      })
    });

    schema.checkAsync({ url: 'url', user: { email: 'a', age: '10' } }).then(status => {
      const user = status.user.object;
      if (
        user.age.hasError &&
        user.age.errorMessage === 'error2' &&
        user.email.hasError &&
        user.email.errorMessage === 'error1'
      ) {
        done();
      }
    });
  });
});
