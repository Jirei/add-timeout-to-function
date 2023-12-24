export async function addTimeoutToFunction<T>(fn: FunctionForAddTimeoutToFunction<T>, timeout: number, cleanupFn?: () => void | Promise<void>): Promise<Awaited<T>> {
  let timedOut = false;
  let hasTimedOut = () => timedOut;
  let timeoutId: number | NodeJS.Timeout | undefined;
  return Promise.race(
    [
      fn(hasTimedOut).then(result => {
        clearTimeout(timeoutId);
        return result;
      }),
      new Promise<T>(
        (_, reject) => {
          timeoutId = setTimeout(async () => {
            reject(new TimeoutError("Function timed out"));
            cleanupFn && await cleanupFn();
          }, timeout);
        })
    ]);
}

export type FunctionForAddTimeoutToFunction<T> = (hasTimedOut?: () => boolean) => Promise<T>;


export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}