# schema-typed

Schema for data modeling & validation

[![npm][npm-badge]][npm]
[![Travis][build-badge]][build]

English | [中文版][readm-cn]

## Installation

```
npm install schema-typed --save
```

## Usage

```js
import { SchemaModel, StringType, DateType, NumberType } from 'schema-typed';

const userModel = SchemaModel({
  username: StringType().isRequired('Username required'),
  email: StringType().isEmail('Email required'),
  age: NumberType('Age should be a number').range(
    18,
    30,
    'Age should be between 18 and 30 years old'
  )
});

const checkResult = userModel.check({
  username: 'foobar',
  email: 'foo@bar.com',
  age: 40
});

console.log(checkResult);
```

`checkResult` return structure is:

```js
{
    username: { hasError: false },
    email: { hasError: false },
    age: { hasError: true, errorMessage: 'Age should be between 18 and 30 years old' }
}
```

## Multiple verification

```js
StringType()
  .minLength(6, "Can't be less than 6 characters")
  .maxLength(30, 'Cannot be greater than 30 characters')
  .isRequired('This field required');
```

## Custom verification

Customize a rule with the `addRule` function.

If you are validating a string type of data, you can set a regular expression for custom validation by the `pattern` method.

```js
const myModel = SchemaModel({
  field1: StringType().addRule((value, data) => {
    return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
  }, 'Please enter legal characters'),
  field2: StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, 'Please enter legal characters')
});

schema.check({ field1: '', field2: '' });

/**
{
  field1: {
    hasError: true,
    errorMessage: 'Please enter legal characters'
  },
  field2: {
    hasError: true,
    errorMessage: 'Please enter legal characters'
  }
};
**/
```

## Custom verification - multi-field cross validation

eg: verify that the two passwords are the same.

```js
const schema = SchemaModel({
  password1: StringType().isRequired('This field required'),
  password2: StringType().addRule((value, data) => {
    if (value !== data.password1) {
      return false;
    }
    return true;
  }, 'The passwords are inconsistent twice')
});

schema.check({ password1: '123456', password2: 'root' });

/**
{
  password1: { hasError: false },
  password2: {
    hasError: true,
    errorMessage: 'The passwords are inconsistent twice'
  }
};
**/
```

## API

### StringType

- isRequired()

```js
StringType().isRequired('This field required');
```

- isEmail(String: errorMessage)

```js
StringType().isEmail('Please input the correct email address');
```

- isURL(String: errorMessage)

```js
StringType().isURL('Please enter the correct URL address');
```

- isOneOf(Array: items, String: errorMessage)

```js
StringType().isOneOf(['Javascript', 'CSS'], 'Can only type `Javascript` and `CSS`');
```

- containsLetter(String: errorMessage)

```js
StringType().containsLetter('Must contain English characters');
```

- containsUppercaseLetter(String: errorMessage)

```js
StringType().containsUppercaseLetter('Must contain uppercase English characters');
```

- containsLowercaseLetter(String: errorMessage)

```js
StringType().containsLowercaseLetter('Must contain lowercase English characters');
```

- containsLetterOnly(String: errorMessage)

```js
StringType().containsLetterOnly('English characters that can only be included');
```

- containsNumber(String: errorMessage)

```js
StringType().containsNumber('Must contain numbers');
```

- pattern(Object: regexp, String: errorMessage)

```js
StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, 'Please enter legal characters');
```

- rangeLength(Number: minLength, Number: maxLength, String: errorMessage)

```js
StringType().rangeLength(6, 30, 'The number of characters can only be between 6 and 30');
```

- minLength(Number: minLength, String: errorMessage)

```js
StringType().minLength(6, 'Minimum 6 characters required');
```

- maxLength(Number: maxLength, String: errorMessage)

```js
StringType().minLength(30, 'The maximum is only 30 characters.');
```

- addRule(Function: onValid, String: errorMessage)

```js
StringType().addRule((value, data) => {
  return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
}, 'Please enter a legal character.');
```

### NumberType

- isRequired()

```js
NumberType().isRequired('This field required');
```

- isInteger(String: errorMessage)

```js
NumberType().isInteger('It can only be an integer');
```

- isOneOf(Array: items, String: errorMessage)

```js
NumberType().isOneOf([5, 10, 15], 'Can only be `5`, `10`, `15`');
```

- pattern(Object: regexp, String: errorMessage)

```js
NumberType().pattern(/^[1-9][0-9]{3}$/, 'Please enter a legal character.');
```

- range(Number: minLength, Number: maxLength, String: errorMessage)

```js
NumberType().range(18, 40, 'Please enter a number between 18 - 40');
```

- min(Number: min, String: errorMessage)

```js
NumberType().min(18, 'Minimum 18');
```

- max(Number: min, String: errorMessage)

```js
NumberType().max(40, 'Maximum 40');
```

- addRule(Function: onValid, String: errorMessage)

```js
NumberType().addRule((value, data) => {
  return value % 5 === 0;
}, 'Please enter a valid number');
```

### ArrayType

- isRequired()

```js
ArrayType().isRequired('This field required');
```

- rangeLength(Number: minLength, Number: maxLength, String: errorMessage)

```js
ArrayType().rangeLength(1, 3, 'Choose at least one, but no more than three');
```

- minLength(Number: minLength, String: errorMessage)

```js
ArrayType().minLength(1, 'Choose at least one');
```

- maxLength(Number: maxLength, String: errorMessage)

```js
ArrayType().maxLength(3, "Can't exceed three");
```

- unrepeatable(String: errorMessage)

```js
ArrayType().unrepeatable('Duplicate options cannot appear');
```

- of(Object: type, String: errorMessage)

```js
ArrayType().of(StringType().isEmail(), 'wrong format');
```

- addRule(Function: onValid, String: errorMessage)

```js
ArrayType().addRule((value, data) => {
  return value.length % 2 === 0;
}, 'Good things are in pairs');
```

### DateType

- isRequired()

```js
DateType().isRequired('This field required');
```

- range(Date: min, Date: max, String: errorMessage)

```js
DateType().range(
  new Date('08/01/2017'),
  new Date('08/30/2017'),
  'Date should be between 08/01/2017 - 08/30/2017'
);
```

- min(Date: min, String: errorMessage)

```js
DateType().min(new Date('08/01/2017'), 'Minimum date 08/01/2017');
```

- max(Date: max, String: errorMessage)

```js
DateType().max(new Date('08/30/2017'), 'Maximum date 08/30/2017');
```

- addRule(Function: onValid, String: errorMessage)

```js
DateType().addRule((value, data) => {
  return value.getDay() === 2;
}, 'Can only choose Tuesday');
```

### ObjectType

- isRequired()

```js
ObjectType().isRequired('This field required');
```

- shape(Object: types)

```js
ObjectType().shape({
  email: StringType().isEmail('Should be an email'),
  age: NumberType().min(18, 'Age should be greater than 18 years old')
});
```

- addRule(Function: onValid, String: errorMessage)

```js
ObjectType().addRule((value, data) => {
  if (value.id || value.email) {
    return true;
  }
  return false;
}, 'Id and email must have one that cannot be empty');
```

### BooleanType

- isRequired()

```js
BooleanType().isRequired('This field required');
```

- addRule(Function: onValid, String: errorMessage)

```js
ObjectType().addRule((value, data) => {
  if (typeof value === 'undefined' && A === 10) {
    return false;
  }
  return true;
}, 'This value is required when A is equal to 10');
```

[readm-cn]: https://github.com/rsuite/schema-typed/blob/master/README_zh.md
[npm-badge]: https://img.shields.io/npm/v/schema-typed.svg
[npm]: https://www.npmjs.com/package/schema-typed
[npm-beta-badge]: https://img.shields.io/npm/v/schema-typed/beta.svg
[npm-beta]: https://www.npmjs.com/package/schema-typed
[build-badge]: https://travis-ci.org/rsuite/schema-typed.svg
[build]: https://travis-ci.org/rsuite/schema-typed
[coverage-badge]: https://coveralls.io/repos/github/rsuite/schema-typed/badge.svg?branch=next
[coverage]: https://coveralls.io/github/rsuite/schema-typed
