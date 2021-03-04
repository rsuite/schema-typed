import { flaser } from 'object-flaser';

const should = require('chai').should();
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
      .checkForField('user', { email: 'simon.guo@hypers.com', age: 19 })
      .shape.email.hasError.should.equal(false);
    schema
      .checkForField('user', { email: 'simon.guo', age: 19 })
      .shape.email.hasError.should.equal(true);

    let checkStatus = schema.checkForField('user', {
      email: 'simon.guo@hypers.com',
      age: 17
    });

    checkStatus.shape.age.hasError.should.equal(true);
    checkStatus.shape.age.errorMessage.should.equal('年龄应该大于18岁');
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

    const abc = schema.check({
      url: 'hsd',
      user: {
        email: 'simon.guo@hypers.com',
        age: 17,
        parent: { email: 'zicheng', age: 40 }
      }
    });

    const checkStatus = schema.checkForField('user', {
      email: 'simon.guo@hypers.com',
      age: 17,
      parent: { email: 'zicheng', age: 40 }
    });

    checkStatus.shape.email.hasError.should.equal(false);
    checkStatus.shape.age.hasError.should.equal(true);
    checkStatus.shape.age.errorMessage.should.equal('年龄应该大于18岁');

    const parentCheckStatus = checkStatus.shape.parent.shape;

    parentCheckStatus.email.hasError.should.equal(true);
    parentCheckStatus.email.errorMessage.should.equal('应该是一个邮箱');
    parentCheckStatus.age.hasError.should.equal(true);
    parentCheckStatus.age.errorMessage.should.equal('年龄应该大于50岁');
  });

  it('Should be a valid object by flaser', () => {
    const schemaData = {
      'data.email': StringType().isEmail('应该是一个 email'),
      'data.age': NumberType().min(18, '年龄应该大于18岁')
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
      url: StringType().isURL('应该是一个 url'),
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
      const user = status.user.shape;
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
