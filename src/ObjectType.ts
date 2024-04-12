import { MixedType, schemaSpecKey } from './MixedType';
import {
  createValidator,
  createValidatorAsync,
  checkRequired,
  isEmpty,
  formatErrorMessage
} from './utils';
import { PlainObject, SchemaDeclaration, CheckResult, ErrorMessageType } from './types';
import { ObjectTypeLocale } from './locales';

export class ObjectType<DataType = any, E = ErrorMessageType> extends MixedType<
  PlainObject,
  DataType,
  E,
  ObjectTypeLocale
> {
  [schemaSpecKey]: SchemaDeclaration<DataType, E>;
  constructor(errorMessage?: E | string) {
    super('object');
    super.pushRule({
      onValid: v => typeof v === 'object',
      errorMessage: errorMessage || this.locale.type
    });
  }

  check(value: PlainObject = this.value, data?: DataType, fieldName?: string | string[]) {
    const check = (value: any, data: any, type: any, childFieldKey?: string) => {
      if (type.required && !checkRequired(value, type.trim, type.emptyAllowed)) {
        return {
          hasError: true,
          errorMessage: formatErrorMessage<E>(type.requiredMessage || type.locale?.isRequired, {
            name: type.fieldLabel || childFieldKey || fieldName
          })
        };
      }

      if (type[schemaSpecKey] && typeof value === 'object') {
        const checkResultObject: any = {};
        let hasError = false;
        Object.entries(type[schemaSpecKey]).forEach(([k, v]) => {
          const checkResult = check(value[k], value, v, k);
          if (checkResult?.hasError) {
            hasError = true;
          }
          checkResultObject[k] = checkResult;
        });

        return { hasError, object: checkResultObject };
      }

      const validator = createValidator<PlainObject, DataType, E | string>(
        data,
        childFieldKey || fieldName,
        type.fieldLabel
      );
      const checkStatus = validator(value, type.priorityRules);

      if (checkStatus) {
        return checkStatus;
      }

      if (!type.required && isEmpty(value)) {
        return { hasError: false };
      }

      return validator(value, type.rules) || { hasError: false };
    };

    return check(value, data, this) as CheckResult<E | string, DataType>;
  }

  checkAsync(value: PlainObject = this.value, data?: DataType, fieldName?: string | string[]) {
    const check = (value: any, data: any, type: any, childFieldKey?: string) => {
      if (type.required && !checkRequired(value, type.trim, type.emptyAllowed)) {
        return Promise.resolve({
          hasError: true,
          errorMessage: formatErrorMessage<E>(type.requiredMessage || type.locale?.isRequired, {
            name: type.fieldLabel || childFieldKey || fieldName
          })
        });
      }

      const validator = createValidatorAsync<PlainObject, DataType, E | string>(
        data,
        childFieldKey || fieldName,
        type.fieldLabel
      );

      return new Promise(resolve => {
        if (type[schemaSpecKey] && typeof value === 'object') {
          const checkResult: any = {};
          const checkAll: Promise<unknown>[] = [];
          const keys: string[] = [];
          Object.entries(type[schemaSpecKey]).forEach(([k, v]) => {
            checkAll.push(check(value[k], value, v, k));
            keys.push(k);
          });

          return Promise.all(checkAll).then(values => {
            let hasError = false;
            values.forEach((v: any, index: number) => {
              if (v?.hasError) {
                hasError = true;
              }
              checkResult[keys[index]] = v;
            });

            resolve({ hasError, object: checkResult });
          });
        }

        return validator(value, type.priorityRules)
          .then((checkStatus: CheckResult<E | string, DataType> | void | null) => {
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
          .then((checkStatus: CheckResult<E | string, DataType> | void | null) => {
            if (checkStatus) {
              resolve(checkStatus);
            }
            resolve({ hasError: false });
          });
      });
    };

    return check(value, data, this) as Promise<CheckResult<E | string, DataType>>;
  }

  /**
   * @example
   * ObjectType().shape({
   *  name: StringType(),
   *  age: NumberType()
   * })
   */
  shape(fields: SchemaDeclaration<DataType, E>) {
    this[schemaSpecKey] = fields;
    return this;
  }
}

export default function getObjectType<DataType = any, E = string>(errorMessage?: E) {
  return new ObjectType<DataType, E>(errorMessage);
}
