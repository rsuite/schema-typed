import { MixedType } from './MixedType';
import { createValidator, createValidatorAsync, checkRequired, isEmpty } from './utils';
import { PlainObject, SchemaDeclaration, CheckResult } from './types';

export class ObjectType<DataType = any, ErrorMsgType = string> extends MixedType<
  PlainObject,
  DataType,
  ErrorMsgType
> {
  objectTypeSchemaSpec: SchemaDeclaration<DataType, ErrorMsgType>;

  constructor(errorMessage?: ErrorMsgType) {
    super('object');
    super.pushRule(v => typeof v === 'object', errorMessage || 'Please enter a valid `object`');
  }

  check(value: PlainObject = this.value, data?: DataType) {
    const check = (value: any, data: any, type: any) => {
      if (type.required && !checkRequired(value, type.trim, type.emptyAllowed)) {
        return { hasError: true, errorMessage: type.requiredMessage };
      }

      if (type.objectTypeSchemaSpec && typeof value === 'object') {
        const checkResultObject: any = {};
        let hasError = false;
        Object.entries(type.objectTypeSchemaSpec).forEach(([k, v]) => {
          const checkResult = check(value[k], value, v);
          if (checkResult?.hasError) {
            hasError = true;
          }
          checkResultObject[k] = checkResult;
        });

        return { hasError, object: checkResultObject };
      }

      const validator = createValidator<PlainObject, DataType, ErrorMsgType | string>(data);

      const checkStatus = validator(value, type.priorityRules);

      if (checkStatus) {
        return checkStatus;
      }

      if (!type.required && isEmpty(value)) {
        return { hasError: false };
      }

      return validator(value, type.rules) || { hasError: false };
    };

    return check(value, data, this) as CheckResult<ErrorMsgType | string>;
  }

  checkAsync(value: PlainObject = this.value, data?: DataType) {
    const check = (value: any, data: any, type: any) => {
      if (type.required && !checkRequired(value, type.trim, type.emptyAllowed)) {
        return Promise.resolve({ hasError: true, errorMessage: this.requiredMessage });
      }

      const validator = createValidatorAsync<PlainObject, DataType, ErrorMsgType | string>(data);

      return new Promise(resolve => {
        if (type.objectTypeSchemaSpec && typeof value === 'object') {
          const checkResult: any = {};
          const checkAll: Promise<unknown>[] = [];
          const keys: string[] = [];
          Object.entries(type.objectTypeSchemaSpec).forEach(([k, v]) => {
            checkAll.push(check(value[k], value, v));
            keys.push(k);
          });

          return Promise.all(checkAll).then(values => {
            values.forEach((v, index) => {
              checkResult[keys[index]] = v;
            });

            resolve({ object: checkResult });
          });
        }

        return validator(value, type.priorityRules)
          .then((checkStatus: CheckResult<ErrorMsgType | string> | void | null) => {
            if (checkStatus) {
              resolve(checkStatus);
            }
          })
          .then(() => {
            if (!type.required && isEmpty(value)) {
              resolve({ hasError: false });
            }
          })
          .then(() => validator(value, type.rules))
          .then((checkStatus: CheckResult<ErrorMsgType | string> | void | null) => {
            if (checkStatus) {
              resolve(checkStatus);
            }
            resolve({ hasError: false });
          });
      });
    };

    return check(value, data, this) as Promise<CheckResult<ErrorMsgType | string>>;
  }

  /**
   * @example
   * ObjectType().shape({
   *  name: StringType(),
   *  age: NumberType()
   * })
   */
  shape(fields: SchemaDeclaration<DataType, ErrorMsgType>) {
    this.objectTypeSchemaSpec = fields;
    return this;
  }
}

export default function getObjectType<DataType = any, ErrorMsgType = string>(
  errorMessage?: ErrorMsgType
) {
  return new ObjectType<DataType, ErrorMsgType>(errorMessage);
}
