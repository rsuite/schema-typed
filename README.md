# rsuite-schema

数据建模及数据验证

## 安装

```
    npm install rsuite-schema --save
```

## 示例

```js
import { SchemaModel, StringType, DateType, NumberType } from 'rsuite-schema';

const userModel = SchemaModel({
    username: StringType().isRequired('用户名不能为空'),
    email: StringType().isEmail('请输入正确的邮箱'),
    age: NumberType('年龄应该是一个数字').range(18,30,'年应该在 18 到 30 岁')
});

const checkResult = userModel.check({
    username:'foobar',
    email:'foo@bar.com',
    age:40
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

## 自定义验证

```js

const myModel = SchemaModel({
    field1: StringType().addRule((value) => {
        return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
    }, '请输入合法字符'),
    field2: StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, '请输入合法字符')
});
```



## API

### StringType
- isRequired()
- isEmail(String errorMessage)
- isURL(String errorMessage)
- isOneOf(String errorMessage)
- containsLetter(String errorMessage)
- containsUppercaseLetter(String errorMessage)
- containsLowercaseLetter(String errorMessage)
- containsLetterOnly(String errorMessage)
- containsNumber(String errorMessage)
- pattern(Object regexp, String errorMessage)
- rangeLength(Number minLength, Number maxLength, String errorMessage)
- minLength(Number minLength, String errorMessage)
- maxLength(Number maxLength, String errorMessage)
- addRule(onValid, errorMessage)

### NumbserType
- isRequired()
- isInteger(String errorMessage)
- isOneOf(String errorMessage)
- pattern(Object regexp, String errorMessage)
- range(Number minLength, Number maxLength, String errorMessage)
- min(Number min, String errorMessage)
- max(Number min, String errorMessage)
- addRule(onValid, errorMessage)

### ArrayType
- isRequired()
- rangeLength(Number minLength, Number maxLength, String errorMessage)
- minLength(Number minLength, String errorMessage)
- maxLength(Number maxLength, String errorMessage)
- unrepeatable(String errorMessage)
- shape(Object type, String errorMessage)
- addRule(onValid, errorMessage)

### DateType
- isRequired()
- range(Date min, Date max, String errorMessage)
- min(Date min, String errorMessage)
- max(Date max, String errorMessage)
- addRule(onValid, errorMessage)

### ObjectType
- isRequired()
- addRule(onValid, errorMessage)

### BooleanType
- isRequired()
- addRule(onValid, errorMessage)
