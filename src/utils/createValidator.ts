import { CheckResult, RuleType } from '../types';

/**
 * Create a data validator
 * @param data
 */
export function createValidator<V, D, E>(data?: D) {
  return (value: V, rules: RuleType<V, D, E>[]): CheckResult<E> | null => {
    for (let i = 0; i < rules.length; i += 1) {
      const { onValid, errorMessage } = rules[i];
      const checkResult = onValid(value, data);

      if (checkResult === false) {
        return { hasError: true, errorMessage };
      } else if (typeof checkResult === 'object' && (checkResult.hasError || checkResult.array)) {
        return checkResult;
      }
    }

    return null;
  };
}

export default createValidator;
