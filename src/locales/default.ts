export default {
  mixed: {
    isRequired: '${name} is a required field',
    isRequiredOrEmpty: '${name} is a required field',
    equalTo: '${name} must be the same as ${toFieldName}'
  },
  array: {
    type: '${name} must be an array',
    rangeLength: '${name} must contain ${minLength} to ${maxLength} items',
    minLength: '${name} field must have at least ${minLength} items',
    maxLength: '${name} field must have less than or equal to ${maxLength} items',
    unrepeatable: '${name} must have non-repeatable items'
  },
  boolean: {
    type: '${name} must be a boolean'
  },
  date: {
    type: '${name} must be a date',
    min: '${name} field must be later than ${min}',
    max: '${name} field must be at earlier than ${max}',
    range: '${name} field must be between ${min} and ${max}'
  },
  number: {
    type: '${name} must be a number',
    isInteger: '${name} must be an integer',
    pattern: '${name} is invalid',
    isOneOf: '${name} must be one of the following values: ${values}',
    range: '${name} field must be between ${min} and ${max}',
    min: '${name} must be greater than or equal to ${min}',
    max: '${name} must be less than or equal to ${max}'
  },
  string: {
    type: '${name} must be a string',
    containsLetter: '${name} field must contain letters',
    containsUppercaseLetter: '${name} must be a upper case string',
    containsLowercaseLetter: '${name} must be a lowercase string',
    containsLetterOnly: '${name} must all be letters',
    containsNumber: '${name} field must contain numbers',
    isOneOf: '${name} must be one of the following values: ${values}',
    isEmail: '${name} must be a valid email',
    isURL: '${name} must be a valid URL',
    isHex: '${name} must be a valid hexadecimal',
    pattern: '${name} is invalid',
    rangeLength: '${name} must contain ${minLength} to ${maxLength} characters',
    minLength: '${name} must be at least ${minLength} characters',
    maxLength: '${name} must be at most ${maxLength} characters'
  },
  object: {
    type: '${name} must be an object'
  }
};
