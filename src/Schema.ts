import { SchemaDeclaration, SchemaCheckResult, CheckResult, PlainObject } from './types';
import { MixedType } from './MixedType';
import get from './utils/get';

interface CheckOptions {
  /**
   * Check for nested object
   */
  nestedObject?: boolean;
}

/**
 * Get the field value from the data object
 */
function getFieldValue(data: PlainObject, fieldName: string, nestedObject?: boolean) {
  return nestedObject ? get(data, fieldName) : data?.[fieldName];
}

export class Schema<DataType = any, ErrorMsgType = string> {
  readonly spec: SchemaDeclaration<DataType, ErrorMsgType>;
  private data: PlainObject;

  constructor(schema: SchemaDeclaration<DataType, ErrorMsgType>) {
    this.spec = schema;
  }

  getFieldType<T extends keyof DataType>(fieldName: T, nestedObject?: boolean) {
    if (nestedObject) {
      const namePath = (fieldName as string).split('.').join('.objectTypeSchemaSpec.');

      return get(this.spec, namePath);
    }

    return this.spec?.[fieldName];
  }

  getKeys() {
    return Object.keys(this.spec);
  }

  setSchemaOptionsForAllType(data: PlainObject) {
    if (data === this.data) {
      return;
    }

    Object.entries(this.spec).forEach(([key, type]) => {
      (type as MixedType).setSchemaOptions(this.spec as any, data?.[key]);
    });

    this.data = data;
  }

  checkForField<T extends keyof DataType>(
    fieldName: T,
    data: DataType,
    options: CheckOptions = {}
  ): CheckResult<ErrorMsgType | string> {
    this.setSchemaOptionsForAllType(data);

    const { nestedObject } = options;
    const fieldChecker = this.getFieldType(fieldName, nestedObject);

    if (!fieldChecker) {
      // fieldValue can be anything if no schema defined
      return { hasError: false };
    }

    const fieldValue = getFieldValue(data, fieldName as string, nestedObject);

    return fieldChecker.check(fieldValue, data, fieldName as string);
  }

  checkForFieldAsync<T extends keyof DataType>(
    fieldName: T,
    data: DataType,
    options: CheckOptions = {}
  ): Promise<CheckResult<ErrorMsgType | string>> {
    this.setSchemaOptionsForAllType(data);

    const { nestedObject } = options;
    const fieldChecker = this.getFieldType(fieldName, nestedObject);

    if (!fieldChecker) {
      // fieldValue can be anything if no schema defined
      return Promise.resolve({ hasError: false });
    }

    const fieldValue = getFieldValue(data, fieldName as string, nestedObject);

    return fieldChecker.checkAsync(fieldValue, data, fieldName as string);
  }

  check<T extends keyof DataType>(data: DataType) {
    const checkResult: PlainObject = {};
    Object.keys(this.spec).forEach(key => {
      if (typeof data === 'object') {
        checkResult[key] = this.checkForField(key as T, data);
      }
    });

    return checkResult as SchemaCheckResult<DataType, ErrorMsgType>;
  }

  checkAsync<T extends keyof DataType>(data: DataType) {
    const checkResult: PlainObject = {};
    const promises: Promise<CheckResult<ErrorMsgType | string>>[] = [];
    const keys: string[] = [];

    Object.keys(this.spec).forEach((key: string) => {
      keys.push(key);
      promises.push(this.checkForFieldAsync(key as T, data));
    });

    return Promise.all(promises).then(values => {
      for (let i = 0; i < values.length; i += 1) {
        checkResult[keys[i]] = values[i];
      }
      return checkResult as SchemaCheckResult<DataType, ErrorMsgType>;
    });
  }
}

export function SchemaModel<DataType = PlainObject, ErrorMsgType = string>(
  o: SchemaDeclaration<DataType, ErrorMsgType>
) {
  return new Schema<DataType, ErrorMsgType>(o);
}

SchemaModel.combine = function combine<DataType = any, ErrorMsgType = string>(
  ...specs: Schema<any, ErrorMsgType>[]
) {
  return new Schema<DataType, ErrorMsgType>(
    specs
      .map(model => model.spec)
      .reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue), {} as any)
  );
};
