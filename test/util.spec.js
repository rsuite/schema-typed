const { asyncSerialArray, asyncParallelArray } = require('../src/util');

describe('#asyncSerialArray', () => {
  it('should support synchronized validate', done => {
    const fn1Gen = () => jest.fn(cb => cb({ hasError: false }));
    const fn2Gen = () => jest.fn(cb => cb({ hasError: true, errorMessage: 'error message' }));

    // no error
    const fn1 = fn1Gen();
    const fn2 = fn1Gen();

    asyncSerialArray(
      [fn1, fn2],
      (fn, _, next) => fn(next),
      result => {
        expect(fn1).toHaveBeenCalled();
        expect(fn2).toHaveBeenCalled();
        expect(fn1).toHaveBeenCalledTimes(1);
        expect(fn2).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ hasError: false });
      }
    );

    // 1st with error
    const fn3 = fn2Gen();
    const fn4 = fn1Gen();

    asyncSerialArray(
      [fn3, fn4],
      (fn, _, next) => fn(next),
      result => {
        expect(fn3).toHaveBeenCalled();
        expect(fn4).not.toHaveBeenCalled();
        expect(fn3).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ hasError: true, errorMessage: 'error message' });
      }
    );

    // 2st with error
    const fn5 = fn1Gen();
    const fn6 = fn2Gen();

    asyncSerialArray(
      [fn5, fn6],
      (fn, _, next) => fn(next),
      result => {
        expect(fn5).toHaveBeenCalled();
        expect(fn6).toHaveBeenCalled();
        expect(fn5).toHaveBeenCalledTimes(1);
        expect(fn6).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ hasError: true, errorMessage: 'error message' });
      }
    );

    setTimeout(() => done(), 250);
  });

  it('should support asynchronized validate', done => {
    const fn1Gen = () => jest.fn(cb => cb({ hasError: false }));
    const fn2Gen = () => jest.fn(cb => cb({ hasError: true, errorMessage: 'error message' }));
    const fn3Gen = time => jest.fn(cb => setTimeout(() => cb({ hasError: false }), time));
    const fn4Gen = time =>
      jest.fn(cb =>
        setTimeout(
          () => cb({ hasError: true, errorMessage: `error message setTimeout ${time}` }),
          time
        )
      );

    // 1st async callback without error
    const fn1 = fn3Gen(500);
    const fn2 = fn1Gen();

    asyncSerialArray(
      [fn1, fn2],
      (fn, _, next) => fn(next),
      result => {
        expect(fn1).toHaveBeenCalled();
        expect(fn2).toHaveBeenCalled();
        expect(fn1).toHaveBeenCalledTimes(1);
        expect(fn2).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ hasError: false });
      }
    );

    // 2st async callback without error
    const fn3 = fn3Gen(500);
    const fn4 = fn1Gen();

    asyncSerialArray(
      [fn3, fn4],
      (fn, _, next) => fn(next),
      result => {
        expect(fn3).toHaveBeenCalled();
        expect(fn4).toHaveBeenCalled();
        expect(fn3).toHaveBeenCalledTimes(1);
        expect(fn4).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ hasError: false });
      }
    );

    // 1st sync callback with error
    const fn7 = fn2Gen();
    const fn8 = fn3Gen(500);

    asyncSerialArray(
      [fn7, fn8],
      (fn, _, next) => fn(next),
      result => {
        expect(fn7).toHaveBeenCalled();
        expect(fn8).not.toHaveBeenCalled();
        expect(fn7).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ hasError: true, errorMessage: 'error message' });
      }
    );

    // 2st sync callback with error
    const fn9 = fn3Gen(500);
    const fn10 = fn2Gen();

    asyncSerialArray(
      [fn9, fn10],
      (fn, _, next) => fn(next),
      result => {
        expect(fn9).toHaveBeenCalled();
        expect(fn10).toHaveBeenCalled();
        expect(fn9).toHaveBeenCalledTimes(1);
        expect(fn10).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ hasError: true, errorMessage: 'error message' });
      }
    );

    // 1st async callback with error
    const fn11 = fn4Gen(500);
    const fn12 = fn1Gen();

    asyncSerialArray(
      [fn11, fn12],
      (fn, _, next) => fn(next),
      result => {
        expect(fn11).toHaveBeenCalled();
        expect(fn12).not.toHaveBeenCalled();
        expect(fn11).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'error message setTimeout 500'
        });
      }
    );

    // 2st async callback with error
    const fn13 = fn1Gen();
    const fn14 = fn4Gen(500);

    asyncSerialArray(
      [fn13, fn14],
      (fn, _, next) => fn(next),
      result => {
        expect(fn13).toHaveBeenCalled();
        expect(fn14).toHaveBeenCalled();
        expect(fn13).toHaveBeenCalledTimes(1);
        expect(fn14).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'error message setTimeout 500'
        });
      }
    );

    // 1st async callback with error, 2st async callback without error
    const fn15 = fn4Gen(500);
    const fn16 = fn3Gen(250);

    asyncSerialArray(
      [fn15, fn16],
      (fn, _, next) => fn(next),
      result => {
        expect(fn15).toHaveBeenCalled();
        expect(fn16).not.toHaveBeenCalled();
        expect(fn15).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'error message setTimeout 500'
        });
      }
    );

    // 1st async callback without error, 2st async callback with error
    const fn17 = fn3Gen(250);
    const fn18 = fn4Gen(500);

    // timeout = 500 + 250
    asyncSerialArray(
      [fn17, fn18],
      (fn, _, next) => fn(next),
      result => {
        expect(fn17).toHaveBeenCalled();
        expect(fn18).toHaveBeenCalled();
        expect(fn17).toHaveBeenCalledTimes(1);
        expect(fn18).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          hasError: true,
          errorMessage: 'error message setTimeout 500'
        });
      }
    );

    setTimeout(() => done(), 1000);
  });
});

describe('#asyncParallelArray', () => {
  it('should support synchronized validate', done => {
    const fn1Gen = () => jest.fn(cb => cb({ hasError: false }));
    const fn2Gen = () => jest.fn(cb => cb({ hasError: true, errorMessage: 'error message' }));

    // no errors
    const fn1 = {
      a: fn1Gen(),
      b: fn1Gen()
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn1[key](next),
      result => {
        expect(fn1.a).toHaveBeenCalled();
        expect(fn1.b).toHaveBeenCalled();
        expect(fn1.a).toHaveBeenCalledTimes(1);
        expect(fn1.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ a: { hasError: false }, b: { hasError: false } });
      }
    );

    // 1st with error
    const fn2 = {
      a: fn2Gen(),
      b: fn1Gen()
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn2[key](next),
      result => {
        expect(fn2.a).toHaveBeenCalled();
        expect(fn2.b).toHaveBeenCalled();
        expect(fn2.a).toHaveBeenCalledTimes(1);
        expect(fn2.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          a: { hasError: true, errorMessage: 'error message' },
          b: { hasError: false }
        });
      }
    );

    // 2st with error
    const fn3 = {
      a: fn1Gen(),
      b: fn2Gen()
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn3[key](next),
      result => {
        expect(fn3.a).toHaveBeenCalled();
        expect(fn3.b).toHaveBeenCalled();
        expect(fn3.a).toHaveBeenCalledTimes(1);
        expect(fn3.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          a: { hasError: false },
          b: { hasError: true, errorMessage: 'error message' }
        });
      }
    );

    setTimeout(() => done(), 250);
  });

  it('should support asynchronized validate', done => {
    const fn1Gen = () => jest.fn(cb => cb({ hasError: false }));
    const fn2Gen = () => jest.fn(cb => cb({ hasError: true, errorMessage: 'error message' }));
    const fn3Gen = time => jest.fn(cb => setTimeout(() => cb({ hasError: false }), time));
    const fn4Gen = time =>
      jest.fn(cb =>
        setTimeout(
          () => cb({ hasError: true, errorMessage: `error message setTimeout ${time}` }),
          time
        )
      );

    // 1st async without error
    const fn1 = {
      a: fn3Gen(500),
      b: fn1Gen()
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn1[key](next),
      result => {
        expect(fn1.a).toHaveBeenCalled();
        expect(fn1.b).toHaveBeenCalled();
        expect(fn1.a).toHaveBeenCalledTimes(1);
        expect(fn1.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ a: { hasError: false }, b: { hasError: false } });
      }
    );

    // 2st async without error
    const fn2 = {
      a: fn1Gen(),
      b: fn3Gen(500)
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn2[key](next),
      result => {
        expect(fn2.a).toHaveBeenCalled();
        expect(fn2.b).toHaveBeenCalled();
        expect(fn2.a).toHaveBeenCalledTimes(1);
        expect(fn2.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ a: { hasError: false }, b: { hasError: false } });
      }
    );

    // 1st sync with error
    const fn3 = {
      a: fn2Gen(),
      b: fn3Gen(500)
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn3[key](next),
      result => {
        expect(fn3.a).toHaveBeenCalled();
        expect(fn3.b).toHaveBeenCalled();
        expect(fn3.a).toHaveBeenCalledTimes(1);
        expect(fn3.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          a: { hasError: true, errorMessage: 'error message' },
          b: { hasError: false }
        });
      }
    );

    // 2st sync with error
    const fn4 = {
      a: fn3Gen(500),
      b: fn2Gen()
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn4[key](next),
      result => {
        expect(fn4.a).toHaveBeenCalled();
        expect(fn4.b).toHaveBeenCalled();
        expect(fn4.a).toHaveBeenCalledTimes(1);
        expect(fn4.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          a: { hasError: false },
          b: { hasError: true, errorMessage: 'error message' }
        });
      }
    );

    // 1st async with error
    const fn5 = {
      a: fn4Gen(500),
      b: fn1Gen()
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn5[key](next),
      result => {
        expect(fn5.a).toHaveBeenCalled();
        expect(fn5.b).toHaveBeenCalled();
        expect(fn5.a).toHaveBeenCalledTimes(1);
        expect(fn5.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          a: { hasError: true, errorMessage: 'error message setTimeout 500' },
          b: { hasError: false }
        });
      }
    );

    // 2st async with error
    const fn6 = {
      a: fn1Gen(),
      b: fn4Gen(500)
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn6[key](next),
      result => {
        expect(fn6.a).toHaveBeenCalled();
        expect(fn6.b).toHaveBeenCalled();
        expect(fn6.a).toHaveBeenCalledTimes(1);
        expect(fn6.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          a: { hasError: false },
          b: { hasError: true, errorMessage: 'error message setTimeout 500' }
        });
      }
    );

    // 1st async with error, 2st async without error
    const fn7 = {
      a: fn4Gen(500),
      b: fn3Gen(250)
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn7[key](next),
      result => {
        expect(fn7.a).toHaveBeenCalled();
        expect(fn7.b).toHaveBeenCalled();
        expect(fn7.a).toHaveBeenCalledTimes(1);
        expect(fn7.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          a: { hasError: true, errorMessage: 'error message setTimeout 500' },
          b: { hasError: false }
        });
      }
    );

    // 1st async without error, 2st async with error
    const fn8 = {
      a: fn3Gen(250),
      b: fn4Gen(500)
    };

    asyncParallelArray(
      ['a', 'b'],
      (key, _, next) => fn8[key](next),
      result => {
        expect(fn8.a).toHaveBeenCalled();
        expect(fn8.b).toHaveBeenCalled();
        expect(fn8.a).toHaveBeenCalledTimes(1);
        expect(fn8.b).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
          a: { hasError: false },
          b: { hasError: true, errorMessage: 'error message setTimeout 500' }
        });
      }
    );

    setTimeout(() => done(), 750);
  });
});
