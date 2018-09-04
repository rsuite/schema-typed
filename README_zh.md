# schema-typed

`schema-typed` 是一个数据建模及数据验证工具

版本与状态

[![npm][npm-badge]][npm]
[![Travis][build-badge]][build]

[English][readm-en] | 中文版

## 安装

```
npm install schema-typed --save
```

## 示例

```js
import { SchemaModel, StringType, DateType, NumberType } from 'schema-typed';

const model = SchemaModel({
  username: StringType().isRequired('用户名不能为空'),
  email: StringType().isEmail('请输入正确的邮箱'),
  age: NumberType('年龄应该是一个数字').range(18, 30, '年龄应该在 18 到 30 岁之间')
});

const checkResult = model.check({
  username: 'foobar',
  email: 'foo@bar.com',
  age: 40
});

console.log(checkResult);
```

`checkResult` 返回结构是:

```js
{
    username: { hasError: false },
    email: { hasError: false },
    age: { hasError: true, errorMessage: '年龄应该在 18 到 30 岁之间' }
}
```

## 多重验证

```js
StringType()
  .minLength(6, '不能少于 6 个字符')
  .maxLength(30, '不能大于 30 个字符')
  .isRequired('该字段不能为空');
```

## 自定义验证

通过 `addRule` 函数自定义一个规则。

如果是对一个字符串类型的数据进行验证，可以通过 `pattern` 方法设置一个正则表达式进行自定义验证。

```js
const model = SchemaModel({
  field1: StringType().addRule((value, data) => {
    return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
  }, '请输入合法字符'),
  field2: StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, '请输入合法字符')
});

model.check({ field1: '', field2: '' });

/**
{
  field1: {
    hasError: true,
    errorMessage: '请输入合法字符'
  },
  field2: {
    hasError: true,
    errorMessage: '请输入合法字符'
  }
};
**/
```

## 自定义验证 - 多字段交叉验证

例如，验证两次输入密码是否一致

```js
const model = SchemaModel({
  password1: StringType().isRequired('该字段不能为空'),
  password2: StringType().addRule((value, data) => {
    if (value !== data.password1) {
      return false;
    }
    return true;
  }, '两次密码不一致')
});

model.check({ password1: '123456', password2: 'root' });

/**
{
  password1: { hasError: false },
  password2: {
    hasError: true,
    errorMessage: '两次密码不一致'
  }
};
**/
```

## 嵌套对象

对于复杂的嵌套的 Object , 可以使用 ObjectType().shape 方法进行定义，比如：

```js
const model = SchemaModel({
  id: NumberType().isRequired('该字段不能为空'),
  name: StringType().isRequired('用户名不能为空'),
  info: ObjectType().shape({
    email: StringType().isEmail('应该是一个 email'),
    age: NumberType().min(18, '年龄应该大于18岁')
  });
});
```

另外，更推荐把对象扁平化设计

```js
import { flaser } from 'object-flaser';

const model = SchemaModel({
  id: NumberType().isRequired('该字段不能为空'),
  name: StringType().isRequired('用户名不能为空'),
  'info.email': StringType().isEmail('应该是一个 email'),
  'info.age': NumberType().min(18, '年龄应该大于18岁')
});

const user = flaser({
  id: 1,
  name: 'schema-type',
  info: {
    email: 'schema-type@gmail.com',
    age: 17
  }
});

model.check(data);
```

## 组合

`SchemaModel` 提供了一个静态方法 `combine`, 可以对多个 `SchemaModel` 合并返回一个新的 `SchemaModel`。

```js
const model1 = SchemaModel({
  username: StringType().isRequired('用户名不能为空'),
  email: StringType().isEmail('请输入正确的邮箱')
});

const model2 = SchemaModel({
  username: StringType().minLength(7, '最少7个字符'),
  age: NumberType().range(18, 30, '年应该在 18 到 30 岁')
});

const model3 = SchemaModel({
  groupId: NumberType().isRequired('该字段不能为空')
});

const model4 = SchemaModel.combine(model1, model2, model3);

model4.check({
  username: 'foobar',
  email: 'foo@bar.com',
  age: 40,
  groupId: 1
});
```

## API

- SchemaModel
- StringType
- NumberType
- ArrayType
- DateType
- ObjectType
- BooleanType

### SchemaModel

- `static` combine(...models)

```js
const model1 = SchemaModel({
  username: StringType().isRequired('用户名不能为空')
});

const model2 = SchemaModel({
  email: StringType().isEmail('请输入正确的邮箱')
});

const model3 = SchemaModel.combine(model1, model2);
```

- check(data: Object)

```js
const model = SchemaModel({
  username: StringType().isRequired('该字段不能为空'),
  email: StringType().isEmail('请输入正确的邮箱')
});

model.check({
  username: 'root',
  email: 'root@email.com'
});
```

- checkForField(fieldName: string, fieldValue: any, data: Object)

```js
const model = SchemaModel({
  username: StringType().isRequired('该字段不能为空'),
  email: StringType().isEmail('请输入正确的邮箱')
});

model.checkForField('username', 'root');
```

### StringType

- isRequired(errorMessage: string)

```js
StringType().isRequired('该字段不能为空');
```

- isEmail(errorMessage: string)

```js
StringType().isEmail('请输入正确的邮箱地址');
```

- isURL(errorMessage: string)

```js
StringType().isURL('请输入正确的URL地址');
```

- isOneOf(items: Array, errorMessage: string)

```js
StringType().isOneOf(['Javascript', 'CSS'], '只能输入 `Javascript`和 `CSS`');
```

- containsLetter(errorMessage: string)

```js
StringType().containsLetter('必须包含英文字符');
```

- containsUppercaseLetter(errorMessage: string)

```js
StringType().containsUppercaseLetter('必须包含大写的英文字符');
```

- containsLowercaseLetter(errorMessage: string)

```js
StringType().containsLowercaseLetter('必须包含小写的英文字符');
```

- containsLetterOnly(errorMessage: string)

```js
StringType().containsLetterOnly('只能包含的英文字符');
```

- containsNumber(errorMessage: string)

```js
StringType().containsNumber('必须包含数字');
```

- pattern(regExp: RegExp, errorMessage: string)

```js
StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, '请输入合法字符');
```

- rangeLength(minLength: number, maxLength: number, errorMessage: string)

```js
StringType().rangeLength(6, 30, '字符个数只能在 6 - 30 之间');
```

- minLength(minLength: number, errorMessage: string)

```js
StringType().minLength(6, '最小需要6个字符');
```

- maxLength(maxLength: number, errorMessage: string)

```js
StringType().minLength(30, '最大只能30个字符');
```

- addRule(onValid: Function, errorMessage: string)

```js
StringType().addRule((value, data) => {
  return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
}, '请输入合法字符');
```

### NumberType

- isRequired(errorMessage: string)

```js
NumberType().isRequired('该字段必填');
```

- isInteger(errorMessage: string)

```js
NumberType().isInteger('只能是整型');
```

- isOneOf(items: Array, errorMessage: string)

```js
NumberType().isOneOf([5, 10, 15], '只能是`5`,`10`,`15`');
```

- pattern(regExp: RegExp, errorMessage: string)

```js
NumberType().pattern(/^[1-9][0-9]{3}$/, '请输入合法字符');
```

- range(minLength: number, maxLength: number, errorMessage: string)

```js
NumberType().range(18, 40, '请输入 18 - 40 之间的数字');
```

- min(min: number, errorMessage: string)

```js
NumberType().min(18, '最小值 18');
```

- max(max: number, errorMessage: string)

```js
NumberType().max(40, '最大值 40');
```

- addRule(onValid: Function, errorMessage: string)

```js
NumberType().addRule((value, data) => {
  return value % 5 === 0;
}, '请输入有效的数字');
```

### ArrayType

- isRequired(errorMessage: string)

```js
ArrayType().isRequired('该字段必填');
```

- rangeLength(minLength: number, maxLength: number, errorMessage: string)

```js
ArrayType().rangeLength(1, 3, '至少选择1个，但不能超过3个');
```

- minLength(minLength: number, errorMessage: string)

```js
ArrayType().minLength(1, '至少选择1个');
```

- maxLength(maxLength: number, errorMessage: string)

```js
ArrayType().maxLength(3, '不能超过3个');
```

- unrepeatable(errorMessage: string)

```js
ArrayType().unrepeatable('不能出现重复选项');
```

- of(type: Object, errorMessage: string)

```js
ArrayType().of(StringType().isEmail(), '格式错误');
```

- addRule(onValid: Function, errorMessage: string)

```js
ArrayType().addRule((value, data) => {
  return value.length % 2 === 0;
}, '好事成双');
```

### DateType

- isRequired(errorMessage: string)

```js
DateType().isRequired('日期不能为空');
```

- range(min: Date, max: Date, errorMessage: string)

```js
DateType().range(
  new Date('08/01/2017'),
  new Date('08/30/2017'),
  '时间应该在 08/01/2017 - 08/30/2017 之间'
);
```

- min(min: Date, errorMessage: string)

```js
DateType().min(new Date('08/01/2017'), '时间的最小值 08/01/2017');
```

- max(max: Date, errorMessage: string)

```js
DateType().max(new Date('08/30/2017'), '时间的最大值 08/30/2017');
```

- addRule(onValid: Function, errorMessage: string)

```js
DateType().addRule((value, data) => {
  return value.getDay() === 2;
}, '只能选择周二');
```

### ObjectType

- isRequired(errorMessage: string)

```js
ObjectType().isRequired('该对象不能为空');
```

- shape(type: Object)

```js
ObjectType().shape({
  email: StringType().isEmail('应该是一个 email'),
  age: NumberType().min(18, '年龄应该大于18岁')
});
```

- addRule(onValid: Function, errorMessage: string)

```js
ObjectType().addRule((value, data) => {
  if (value.id || value.email) {
    return true;
  }
  return false;
}, 'id 与 email 必须有一个不能为空');
```

### BooleanType

- isRequired(errorMessage: string)

```js
BooleanType().isRequired('该字段不能为空');
```

- addRule(onValid: Function, errorMessage: string)

```js
ObjectType().addRule((value, data) => {
  if (typeof value === 'undefined' && A === 10) {
    return false;
  }
  return true;
}, '当 A 等于 10 的时候，该值必须为空');
```

## License

`schema-typed` is [MIT licensed](https://github.com/rsuite/schema-typed/blob/master/LICENSE).

[readm-en]: https://github.com/rsuite/schema-typed/blob/master/README.md
[npm-badge]: https://img.shields.io/npm/v/schema-typed.svg
[npm]: https://www.npmjs.com/package/schema-typed
[npm-beta-badge]: https://img.shields.io/npm/v/schema-typed/beta.svg
[npm-beta]: https://www.npmjs.com/package/schema-typed
[build-badge]: https://travis-ci.org/rsuite/schema-typed.svg
[build]: https://travis-ci.org/rsuite/schema-typed
[coverage-badge]: https://coveralls.io/repos/github/rsuite/schema-typed/badge.svg?branch=next
[coverage]: https://coveralls.io/github/rsuite/schema-typed
