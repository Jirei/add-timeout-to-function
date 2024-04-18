This package is functional and has been tested but does not include documentation. It is primarily intended for personal use.

```ts
export function addTimeoutToFunction<T extends FnReturningPromise>({ fn, timeout, cleanupFn, includeTimeoutArgs = false }: { fn: T, timeout: number; cleanupFn?: () => void | Promise<void>; includeTimeoutArgs?: boolean; }) {
  return (...args: ExcludeLastFromTupleIfTimeoutArgs<Parameters<T>>) => addTimeoutToFunctionInternal<T>({ fn, args, timeout, cleanupFn, includeTimeoutArgs });
}


function addTimeoutToFunctionInternal<T extends FnReturningPromise>({ fn, args, timeout, cleanupFn, includeTimeoutArgs }: { fn: T, args: ExcludeLastFromTupleIfTimeoutArgs<Parameters<T>>, timeout: number, cleanupFn?: () => void | Promise<void>; includeTimeoutArgs: boolean; }): Promise<Awaited<ReturnType<T>>> {
  let onHasTimedOut: () => void | undefined;
  let timeoutArgsOrUndefined;
  if (includeTimeoutArgs) {
    const setHandleHasTimedOut = (fn: FnWithNoArgs) => onHasTimedOut = fn;
    timeoutArgsOrUndefined = { setHandleHasTimedOut };
  }
  let timeoutId: number | NodeJS.Timeout | undefined;
  return Promise.race<ReturnType<T>>(
    [
      fn(...args, timeoutArgsOrUndefined).then(result => {
        clearTimeout(timeoutId);
        return result;
      }),
      new Promise<void>(
        (_, reject) => {
          timeoutId = setTimeout(async () => {
            reject(new TimeoutError("Function timed out"));
            onHasTimedOut && onHasTimedOut();
            cleanupFn && cleanupFn();
          }, timeout);
        })
    ]);
}
```