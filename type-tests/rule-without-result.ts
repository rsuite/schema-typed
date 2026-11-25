import { StringType, ValidCallbackType } from '../lib';

const sideEffect: ValidCallbackType<string, unknown, string> = value => {
  const fieldValue: string = value;
  fieldValue.trim();
};

StringType().addRule(sideEffect);
StringType().addRule(value => {
  if (value.length > 3) {
    return false;
  }
});
StringType().addRule(() => undefined);

// @ts-expect-error Asynchronous rules belong in addAsyncRule.
StringType().addRule(async () => undefined);
// @ts-expect-error Numeric results do not express a validation decision.
StringType().addRule(() => 0);
