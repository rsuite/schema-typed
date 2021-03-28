import { CheckResult, RuleType } from '../types';
import formatErrorMessage from './formatErrorMessage';

/**
 * Create a data asynchronous validator
 * @param data
 */
export function createValidatorAsync<V, D, E>(data?: D, name?: string | string[]) {
  function check(errorMessage?: E | string) {
    return (checkResult: CheckResult<E> | boolean): CheckResult<E> | null => {
      if (checkResult === false) {
        return { hasError: true, errorMessage };
      } else if (typeof checkResult === 'object' && (checkResult.hasError || checkResult.array)) {
        return checkResult;
      }
      return null;
    };
  }

  return (value: V, rules: RuleType<V, D, E>[]) => {
    const promises = rules.map(rule => {
      const { onValid, errorMessage, params } = rule;
      return Promise.resolve(onValid(value, data, name)).then(
        check(
          formatErrorMessage<E>(errorMessage, {
            ...params,
            name: Array.isArray(name) ? name.join('.') : name
          })
        )
      );
    });

    return Promise.all(promises).then(results =>
      results.find((item: CheckResult<E> | null) => item && item?.hasError)
    );
  };
}

export default createValidatorAsync;
