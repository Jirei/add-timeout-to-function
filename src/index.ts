export function addTimeoutToFunction<T extends FnReturningPromise>({ fn, timeout, cleanupFn, shouldProvideTimeoutArgs = false }: { fn: T, timeout: number; cleanupFn?: () => void | Promise<void>; shouldProvideTimeoutArgs?: boolean; }) {
  return (...args: ExcludeLastFromTupleIfTimeoutArgs<Parameters<T>>) => addTimeoutToFunctionInternal<T>({ fn, args, timeout, cleanupFn, shouldProvideTimeoutArgs });
}


function addTimeoutToFunctionInternal<T extends FnReturningPromise>({ fn, args, timeout, cleanupFn, shouldProvideTimeoutArgs }: { fn: T, args: ExcludeLastFromTupleIfTimeoutArgs<Parameters<T>>, timeout: number, cleanupFn?: () => void | Promise<void>; shouldProvideTimeoutArgs: boolean; }): Promise<Awaited<ReturnType<T>>> {
  let onHasTimedOut: () => void | undefined;
  let timeoutArgsOrUndefined;
  if (shouldProvideTimeoutArgs) {
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



export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export type FnReturningPromise = (...args: any[]) => Promise<any>;
export type FnReturningPromiseWithTimeoutArgs<T extends FnReturningPromise> = (...args: Parameters<T>) => Promise<any>;
export type FnWithNoArgs = () => any;

export type TimeoutArgs = {
  setHandleHasTimedOut: (fn: FnWithNoArgs) => FnWithNoArgs;
};

export async function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export type ExcludeFromTuple<T extends readonly any[], E> =
  T extends [infer F, ...infer R] ?
  ([F] extends [E] ? ExcludeFromTuple<R, E> : [F, ...ExcludeFromTuple<R, E>])
  : [];


export type ExcludeLastFromTupleIfTimeoutArgs<T extends readonly any[]> = T extends [...infer F, infer R] ?
  ([R] extends [TimeoutArgs] ? F : T) : [];

