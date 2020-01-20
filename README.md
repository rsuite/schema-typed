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

const model = SchemaModel({
  username: StringType().isRequired('Username required'),
  email: StringType().isEmail('Email required'),
  age: NumberType('Age should be a number').range(
    18,
    30,
    'Age should be between 18 and 30 years old'
  )
});

const checkResult = model.check({
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
const model = SchemaModel({
  field1: StringType().addRule((value, data) => {
    return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
  }, 'Please enter legal characters'),
  field2: StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, 'Please enter legal characters')
});

model.check({ field1: '', field2: '' });

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

E.g: verify that the two passwords are the same.

```js
const model = SchemaModel({
  password1: StringType().isRequired('This field required'),
  password2: StringType().addRule((value, data) => {
    if (value !== data.password1) {
      return false;
    }
    return true;
  }, 'The passwords are inconsistent twice')
});

model.check({ password1: '123456', password2: 'root' });

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

## Custom verification - Asynchronous check

For example, verify that the mailbox is duplicated

```js
function asyncCheckEmail(email) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (email === 'foo@domain.com') {
        resolve(false);
      } else {
        resolve(true);
      }
    }, 500);
  });
}

const model = SchemaModel({
  email: StringType()
    .isEmail('Please input the correct email address')
    .addRule((value, data) => {
      return asyncCheckEmail(value);
    }, 'Email address already exists')
    .isRequired('This field cannot be empty')
});

model.checkAsync({ email: 'foo@domain.com' }).then(result => {
  console.log(result);
});

/**
{
  email: {
    hasError: true,
    errorMessage: 'Email address already exists'
  }
};
**/
```

## Validate nested objects

Validate nested objects, which can be defined using the `ObjectType().shape` method. E.g:

```js
const model = SchemaModel({
  id: NumberType().isRequired('This field required'),
  name: StringType().isRequired('This field required'),
  info: ObjectType().shape({
    email: StringType().isEmail('Should be an email'),
    age: NumberType().min(18, 'Age should be greater than 18 years old')
  });
});
```

It is more recommended to flatten the object.

```js
import { flaser } from 'object-flaser';

const model = SchemaModel({
  id: NumberType().isRequired('This field required'),
  name: StringType().isRequired('This field required'),
  'info.email': StringType().isEmail('Should be an email'),
  'info.age': NumberType().min(18, 'Age should be greater than 18 years old')
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

## Combine

`SchemaModel` provides a static method `combine` that can be combined with multiple `SchemaModel` to return a new `SchemaModel`.

```js
const model1 = SchemaModel({
  username: StringType().isRequired('This field required'),
  email: StringType().isEmail('Should be an email')
});

const model2 = SchemaModel({
  username: StringType().minLength(7, "Can't be less than 7 characters"),
  age: NumberType().range(18, 30, 'Age should be greater than 18 years old')
});

const model3 = SchemaModel({
  groupId: NumberType().isRequired('This field required')
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
  username: StringType().isRequired('This field required')
});

const model2 = SchemaModel({
  email: StringType().isEmail('Please input the correct email address')
});

const model3 = SchemaModel.combine(model1, model2);
```

- check(data: Object)

```js
const model = SchemaModel({
  username: StringType().isRequired('This field required'),
  email: StringType().isEmail('Please input the correct email address')
});

model.check({
  username: 'root',
  email: 'root@email.com'
});
```

- checkAsync(data: Object)

```js
const model = SchemaModel({
  username: StringType()
    .isRequired('This field required')
    .addRule(value => {
      return new Promise(resolve => {
        // Asynchronous processing logic
      });
    }, 'Username already exists'),
  email: StringType().isEmail('Please input the correct email address')
});

model
  .checkAsync({
    username: 'root',
    email: 'root@email.com'
  })
  .then(result => {
    // Data verification result
  });
```

- checkForField(fieldName: string, fieldValue: any, data: Object)

```js
const model = SchemaModel({
  username: StringType().isRequired('This field required'),
  email: StringType().isEmail('Please input the correct email address')
});

model.checkForField('username', 'root');
```

- checkForFieldAsync(fieldName: string, fieldValue: any, data: Object)

```js
const model = SchemaModel({
  username: StringType()
    .isRequired('This field required')
    .addRule(value => {
      return new Promise(resolve => {
        // Asynchronous processing logic
      });
    }, 'Username already exists'),
  email: StringType().isEmail('Please input the correct email address')
});

model.checkForFieldAsync('username', 'root').then(result => {
  // Data verification result
});
```

### StringType(errorMessage: string)

- isRequired(errorMessage: string, trim: boolean = true)

```js
StringType().isRequired('This field required');
```

- isRequiredOrEmpty(errorMessage: string, trim: boolean = true)

```js
StringType().isRequiredOrEmpty('This field required');
```

- isEmail(errorMessage: string)

```js
StringType().isEmail('Please input the correct email address');
```

- isURL(errorMessage: string)

```js
StringType().isURL('Please enter the correct URL address');
```

- isOneOf(items: Array, errorMessage: string)

```js
StringType().isOneOf(['Javascript', 'CSS'], 'Can only type `Javascript` and `CSS`');
```

- containsLetter(errorMessage: string)

```js
StringType().containsLetter('Must contain English characters');
```

- containsUppercaseLetter(errorMessage: string)

```js
StringType().containsUppercaseLetter('Must contain uppercase English characters');
```

- containsLowercaseLetter(errorMessage: string)

```js
StringType().containsLowercaseLetter('Must contain lowercase English characters');
```

- containsLetterOnly(errorMessage: string)

```js
StringType().containsLetterOnly('English characters that can only be included');
```

- containsNumber(errorMessage: string)

```js
StringType().containsNumber('Must contain numbers');
```

- pattern(regExp: RegExp, errorMessage: string)

```js
StringType().pattern(/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/, 'Please enter legal characters');
```

- rangeLength(minLength: number, maxLength: number, errorMessage: string)

```js
StringType().rangeLength(6, 30, 'The number of characters can only be between 6 and 30');
```

- minLength(minLength: number, errorMessage: string)

```js
StringType().minLength(6, 'Minimum 6 characters required');
```

- maxLength(maxLength: number, errorMessage: string)

```js
StringType().maxLength(30, 'The maximum is only 30 characters.');
```

- addRule(onValid: Function, errorMessage: string, priority: boolean)

```js
StringType().addRule((value, data) => {
  return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
}, 'Please enter a legal character.');
```

### NumberType(errorMessage: string)

- isRequired(errorMessage: string)

```js
NumberType().isRequired('This field required');
```

- isInteger(errorMessage: string)

```js
NumberType().isInteger('It can only be an integer');
```

- isOneOf(items: Array, errorMessage: string)

```js
NumberType().isOneOf([5, 10, 15], 'Can only be `5`, `10`, `15`');
```

- pattern(regExp: RegExp, errorMessage: string)

```js
NumberType().pattern(/^[1-9][0-9]{3}$/, 'Please enter a legal character.');
```

- range(minLength: number, maxLength: number, errorMessage: string)

```js
NumberType().range(18, 40, 'Please enter a number between 18 - 40');
```

- min(min: number, errorMessage: string)

```js
NumberType().min(18, 'Minimum 18');
```

- max(max: number, errorMessage: string)

```js
NumberType().max(40, 'Maximum 40');
```

- addRule(onValid: Function, errorMessage: string, priority: boolean)

```js
NumberType().addRule((value, data) => {
  return value % 5 === 0;
}, 'Please enter a valid number');
```

### ArrayType(errorMessage: string)

- isRequired(errorMessage: string)

```js
ArrayType().isRequired('This field required');
```

- isRequiredOrEmpty(errorMessage: string)

```js
ArrayType().isRequiredOrEmpty('This field required');
```

- rangeLength(minLength: number, maxLength: number, errorMessage: string)

```js
ArrayType().rangeLength(1, 3, 'Choose at least one, but no more than three');
```

- minLength(minLength: number, errorMessage: string)

```js
ArrayType().minLength(1, 'Choose at least one');
```

- maxLength(maxLength: number, errorMessage: string)

```js
ArrayType().maxLength(3, "Can't exceed three");
```

- unrepeatable(errorMessage: string)

```js
ArrayType().unrepeatable('Duplicate options cannot appear');
```

- of(type: Object, errorMessage: string)

```js
ArrayType().of(StringType().isEmail(), 'wrong format');
```

- addRule(onValid: Function, errorMessage: string, priority: boolean)

```js
ArrayType().addRule((value, data) => {
  return value.length % 2 === 0;
}, 'Good things are in pairs');
```

### DateType(errorMessage: string)

- isRequired(errorMessage: string)

```js
DateType().isRequired('This field required');
```

- range(min: Date, max: Date, errorMessage: string)

```js
DateType().range(
  new Date('08/01/2017'),
  new Date('08/30/2017'),
  'Date should be between 08/01/2017 - 08/30/2017'
);
```

- min(min: Date, errorMessage: string)

```js
DateType().min(new Date('08/01/2017'), 'Minimum date 08/01/2017');
```

- max(max: Date, errorMessage: string)

```js
DateType().max(new Date('08/30/2017'), 'Maximum date 08/30/2017');
```

- addRule(onValid: Function, errorMessage: string, priority: boolean)

```js
DateType().addRule((value, data) => {
  return value.getDay() === 2;
}, 'Can only choose Tuesday');
```

### ObjectType(errorMessage: string)

- isRequired(errorMessage: string)

```js
ObjectType().isRequired('This field required');
```

- shape(type: Object)

```js
ObjectType().shape({
  email: StringType().isEmail('Should be an email'),
  age: NumberType().min(18, 'Age should be greater than 18 years old')
});
```

- addRule(onValid: Function, errorMessage: string, priority: boolean)

```js
ObjectType().addRule((value, data) => {
  if (value.id || value.email) {
    return true;
  }
  return false;
}, 'Id and email must have one that cannot be empty');
```

### BooleanType(errorMessage: string)

- isRequired(errorMessage: string)

```js
BooleanType().isRequired('This field required');
```

- addRule(onValid: Function, errorMessage: string, priority: boolean)

```js
ObjectType().addRule((value, data) => {
  if (typeof value === 'undefined' && A === 10) {
    return false;
  }
  return true;
}, 'This value is required when A is equal to 10');
```

## ⚠️ Notes

Default check priority:

- 1.isRequired
- 2.All other checks are executed in sequence

If the third argument to addRule is `true`, the priority of the check is as follows:

- 1.addRule
- 2.isRequired
- 3.Predefined rules (if there is no isRequired, value is empty, the rule is not executed)

[readm-cn]: https://github.com/rsuite/schema-typed/blob/master/README_zh.md
[npm-badge]: https://img.shields.io/npm/v/schema-typed.svg
[npm]: https://www.npmjs.com/package/schema-typed
[npm-beta-badge]: https://img.shields.io/npm/v/schema-typed/beta.svg
[npm-beta]: https://www.npmjs.com/package/schema-typed
[build-badge]: https://travis-ci.org/rsuite/schema-typed.svg
[build]: https://travis-ci.org/rsuite/schema-typed
[coverage-badge]: https://coveralls.io/repos/github/rsuite/schema-typed/badge.svg?branch=next
[coverage]: https://coveralls.io/github/rsuite/schema-typed
