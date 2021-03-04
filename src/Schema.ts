import { SchemaDeclaration, SchemaCheckResult, CheckResult, PlainObject } from './types';

export class Schema<DataType = any, ErrorMsgType = string> {
  readonly schemaShape: SchemaDeclaration<DataType, ErrorMsgType>;
  constructor(schema: SchemaDeclaration<DataType, ErrorMsgType>) {
    this.schemaShape = schema;
  }

  getFieldType<T extends keyof DataType>(fieldName: T) {
    return this.schemaShape?.[fieldName];
  }

  getKeys() {
    return Object.keys(this.schemaShape);
  }

  checkForField<T extends keyof DataType>(fieldName: T, fieldValue: DataType[T], data?: DataType) {
    const fieldChecker = this.schemaShape[fieldName];

    if (!fieldChecker) {
      // fieldValue can be anything if no schema defined
      return { hasError: false };
    }
    return fieldChecker.check((fieldValue as unknown) as never, data);
  }

  check<T extends keyof DataType>(data: DataType) {
    const checkResult: PlainObject = {};
    Object.keys(this.schemaShape).forEach(key => {
      if (typeof data === 'object') {
        checkResult[key] = this.checkForField(key as T, data[key as keyof DataType], data);
      }
    });

    return checkResult as SchemaCheckResult<DataType, ErrorMsgType>;
  }

  checkForFieldAsync<T extends keyof DataType>(
    fieldName: T,
    fieldValue: DataType[T],
    data?: DataType
  ): Promise<CheckResult<ErrorMsgType | string>> {
    const fieldChecker = this.schemaShape[fieldName];
    if (!fieldChecker) {
      // fieldValue can be anything if no schema defined
      return Promise.resolve({ hasError: false });
    }
    return fieldChecker.checkAsync((fieldValue as unknown) as never, data);
  }

  checkAsync<T extends keyof DataType>(data: DataType) {
    const checkResult: PlainObject = {};
    const promises: Promise<CheckResult<ErrorMsgType | string>>[] = [];
    const keys: string[] = [];

    Object.keys(this.schemaShape).forEach((key: string) => {
      keys.push(key);
      promises.push(this.checkForFieldAsync(key as T, data[key as keyof DataType], data));
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
  ...models: Array<Schema<any, ErrorMsgType>>
) {
  return new Schema<DataType, ErrorMsgType>(
    models
      .map(model => model.schemaShape)
      .reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue), {} as any)
  );
};
