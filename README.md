# rsuite-schema

`rsuite-schema` 是一个数据建模及数据验证工具

版本与状态

[![npm][npm-badge]][npm]
[![Travis][build-badge]][build]

## 安装

```
npm i rsuite-schema --save
// 或者
yarn add rsuite-schema

```

## 示例

```js
import { SchemaModel, StringType, DateType, NumberType } from 'rsuite-schema';

const userModel = SchemaModel({
    username: StringType().isRequired('用户名不能为空'),
    email: StringType().isEmail('请输入正确的邮箱'),
    age: NumberType('年龄应该是一个数字').range(18, 30, '年应该在 18 到 30 岁')
});

const checkResult = userModel.check({
    username: 'foobar',
    email: 'foo@bar.com',
    age: 40
})

console.log(checkResult);
```

`checkResult` 返回结构是:

```js
{
    username: { hasError: false },
    email: { hasError: false },
    age: { hasError: true, errorMessage: '年应该在 18 到 30 岁' }
}
```

## 多重验证

```js
StringType()
  .minLength(6,'不能少于 6 个字符')
  .maxLength(30,'不能大于 30 个字符')
  .isRequired('该字段不能为空');
```


## 自定义验证
通过 `addRule` 函数自定义一个规则。

如果是对一个字符串类型的数据进行验证，可以通过 `pattern` 方法设置一个正则表达式进行自定义验证。

```js

const myModel = SchemaModel({
    field1: StringType().addRule((value) => {
        return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
    }, '请输入合法字符'),
    field2: StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, '请输入合法字符')
});
```

## 自定义动态错误信息

例如，要通过值的不同情况，返回不同的错误信息，参考以下

```js

const myModel = SchemaModel({
    field1: StringType().addRule((value) => {
        if(value==='root'){
          return {
            hasError: true,
            errorMessage:'不能是关键字 root'
          }
        }else if(!/^[a-zA-Z]+$/.test(value)){
          return {
            hasError: true,
            errorMessage:'只能是英文字符'
          }
        }

        return {
            hasError: false
        }
    })
});
```



## API

### StringType
- isRequired()
```js
StringType().isRequired('该字段不能为空');
```
- isEmail(String: errorMessage)
```js
StringType().isEmail('请输入正确的邮箱地址');
```
- isURL(String: errorMessage)
```js
StringType().isURL('请输入正确的URL地址');
```
- isOneOf(Array: items, String: errorMessage)
```js
StringType().isOneOf(['Javascript','CSS'],'只能输入 `Javascript`和 `CSS`');
```
- containsLetter(String: errorMessage)
```js
StringType().containsLetter('必须包含英文字符');
```
- containsUppercaseLetter(String: errorMessage)
```js
StringType().containsUppercaseLetter('必须包含大写的英文字符');
```
- containsLowercaseLetter(String: errorMessage)
```js
StringType().containsLowercaseLetter('必须包含小写的英文字符');
```
- containsLetterOnly(String: errorMessage)
```js
StringType().containsLetterOnly('只能包含的英文字符');
```
- containsNumber(String: errorMessage)
```js
StringType().containsNumber('必须包含数字');
```
- pattern(Object: regexp, String: errorMessage)
```js
StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, '请输入合法字符')
```
- rangeLength(Number: minLength, Number: maxLength, String: errorMessage)
```js
StringType().rangeLength(6, 30, '字符个数只能在 6 - 30 之间')
```
- minLength(Number: minLength, String: errorMessage)
```js
StringType().minLength(6, '最小需要6个字符')
```
- maxLength(Number: maxLength, String: errorMessage)
```js
StringType().minLength(30, '最大只能30个字符')
```
- addRule(Function: onValid, String: errorMessage)
```js
StringType().addRule((value) => {
  return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
}, '请输入合法字符')
```

### NumbserType
- isRequired()
```js
NumbserType().isRequired('该字段必填')
```
- isInteger(String: errorMessage)
```js
NumbserType().isInteger('只能是整型')
```
- isOneOf(Array: items, String: errorMessage)
```js
NumbserType().isOneOf([5,10,15],'只能是`5`,`10`,`15`')
```
- pattern(Object: regexp, String: errorMessage)
```js
NumbserType().pattern(/^[1-9][0-9]{3}$/, '请输入合法字符')
```
- range(Number: minLength, Number: maxLength, String: errorMessage)
```js
NumbserType().range(18, 40, '请输入 18 - 40 之间的数字')
```
- min(Number: min, String: errorMessage)
```js
NumbserType().min(18, '最小值 18')
```
```js
NumbserType().max(40, '最大值 40')
```
- addRule(Function: onValid, String: errorMessage)
```js
NumbserType().addRule((value) => {
  return value % 5 ===0;
}, '请输入有效的数字')
```

### ArrayType
- isRequired()
```js
ArrayType().isRequired('该字段必填')
```
- rangeLength(Number: minLength, Number: maxLength, String: errorMessage)
```js
ArrayType().rangeLength(1, 3, '至少选择1个，但不能超过3个')
```
- minLength(Number: minLength, String: errorMessage)
```js
ArrayType().minLength(1, '至少选择1个')
```
- maxLength(Number: maxLength, String: errorMessage)
```js
ArrayType().maxLength(3, '不能超过3个')
```
- unrepeatable(String: errorMessage)
```js
ArrayType().unrepeatable('不能出现重复选项')
```
- of(Object: type, String: errorMessage)
```js
ArrayType().of(StringType().isEmail(), '格式错误');
```
- addRule(Function: onValid, String: errorMessage)
```js
ArrayType().addRule((value) => {
  return value.length % 2 ===0;
}, '好事成双')
```

### DateType
- isRequired()
```js
DateType().isRequired('日期不能为空');
```
- range(Date: min, Date: max, String: errorMessage)
```js
DateType().range(
  new Date('08/01/2017'),
  new Date('08/30/2017'),
  '时间应该在 08/01/2017 - 08/30/2017 之间'
);
```
- min(Date: min, String: errorMessage)
```js
DateType().min(
  new Date('08/01/2017'),
  '时间的最小值 08/01/2017'
);
```
- max(Date: max, String: errorMessage)
```js
DateType().max(
  new Date('08/30/2017'),
  '时间的最大值 08/30/2017'
);
```
- addRule(Function: onValid, String: errorMessage)
```js
DateType().addRule((value) => {
  return value.getDay()===2;
}, '只能选择周二')
```

### ObjectType
- isRequired()
```js
ObjectType().isRequired('该对象不能为空');
```
- shape(Object: types)
```js
ObjectType().shape({
  email: StringType().isEmail('应该是一个 email'),
  age: NumberType().min(18, '年龄应该大于18岁')
})
```
- addRule(Function: onValid, String: errorMessage)
```js
ObjectType().addRule((value) => {
   if(value.id || value.email){
     return true;
   }
   return false;
}, 'id 与 email 必须有一个不能为空')
```

### BooleanType
- isRequired()
```js
BooleanType().isRequired('该字段不能为空');
```
- addRule(Function: onValid, String: errorMessage)
```js
ObjectType().addRule((value) => {
   if(typeof value === 'undefined' && A === 10){
     return false;
   }
  return true;
}, '当 A 等于 10 的时候，该值必须为空')
```


[npm-badge]: https://img.shields.io/npm/v/rsuite-schema.svg
[npm]: https://www.npmjs.com/package/rsuite-schema


[npm-beta-badge]: https://img.shields.io/npm/v/rsuite-schema/beta.svg
[npm-beta]: https://www.npmjs.com/package/rsuite-schema


[build-badge]: https://travis-ci.org/rsuite/rsuite-schema.svg
[build]: https://travis-ci.org/rsuite/rsuite-schema

[coverage-badge]: https://coveralls.io/repos/github/rsuite/rsuite-schema/badge.svg?branch=next
[coverage]: https://coveralls.io/github/rsuite/rsuite-schema

