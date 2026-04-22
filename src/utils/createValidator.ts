import { CheckResult, RuleType } from '../types';
import formatErrorMessage from './formatErrorMessage';
function isObj(o: unknown): o is Record<PropertyKey, unknown> {
  return o != null && (typeof o === 'object' || typeof o == 'function');
}
function isPromiseLike(v: unknown): v is Promise<unknown> {
  return v instanceof Promise || (isObj(v) && typeof v.then === 'function');
}
/**
 * Create a data validator
 * @param data
 * @param name
 * @param label
 * @param abortEarly  When `false`, all rules are evaluated and all errors are collected into
 *                    `errorMessages`. Defaults to `true` (stop at first error).
 */
export function createValidator<V, D, E>(
  data?: D,
  name?: string | string[],
  label?: string,
  abortEarly = true
) {
  return (value: V, rules: RuleType<V, D, E>[]): CheckResult<E> | null => {
    const errors: (E | string)[] = [];

    for (let i = 0; i < rules.length; i += 1) {
      const { onValid, errorMessage, params, isAsync } = rules[i];
      if (isAsync) continue;
      const checkResult = onValid(value, data, name);
      const errorMsg = typeof errorMessage === 'function' ? errorMessage() : errorMessage;

      if (checkResult === false) {
        const formatted = formatErrorMessage<E>(errorMsg, {
          ...params,
          name: label || (Array.isArray(name) ? name.join('.') : name)
        });

        if (abortEarly) {
          return { hasError: true, errorMessage: formatted };
        }
        if (formatted != null) {
          errors.push(formatted as E | string);
        }
      } else if (isPromiseLike(checkResult)) {
        throw new Error(
          'synchronous validator had an async result, you should probably call "checkAsync()"'
        );
      } else if (typeof checkResult === 'object' && (checkResult.hasError || checkResult.array)) {
        if (abortEarly) {
          return checkResult;
        }
        // For structured results (nested object / array), return immediately even in non-abortEarly mode
        return checkResult;
      }
    }

    if (!abortEarly && errors.length > 0) {
      return { hasError: true, errorMessage: errors[0], errorMessages: errors };
    }

    return null;
  };
}

export default createValidator;
