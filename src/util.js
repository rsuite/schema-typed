import _ from 'lodash';

export function asyncSerialArray(arr, func, callback) {
  const length = arr.length;
  let index = 0;

  function next(result) {
    if (result && result.hasError) {
      return callback(result);
    }

    const oldIndex = index;

    index += 1;

    if (oldIndex >= length) {
      return callback(null);
    }

    return func(arr[oldIndex], oldIndex, next);
  }

  next({ hasError: false });
}

export function asyncParallelArray(arr, func, callback) {
  const length = arr.length;
  let results = {};
  let total = 0;

  arr.forEach(a =>
    func(a, errors => {
      _.set(results, a, errors);

      total += 1;

      if (total === length) {
        callback(results);
      }
    })
  );
}
