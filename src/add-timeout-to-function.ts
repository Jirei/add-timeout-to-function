import {
  AsyncFn,
  ExcludeLastFromTupleIfTimeoutArgs,
  FnWithNoArgs,
} from "./types";

export function addTimeoutToFunction<F extends AsyncFn>({
  fn,
  timeout,
  cleanupFn,
  includeTimeoutArgs = false,
}: AddTimeoutToFunctionParams<F>): AddTimeoutToFunctionReturnType<F> {
  return (...args: ExcludeLastFromTupleIfTimeoutArgs<Parameters<F>>) =>
    _addTimeoutToFunctionInternal<F>({
      fn,
      args,
      timeout,
      cleanupFn,
      includeTimeoutArgs,
    });
}

export type AddTimeoutToFunction = typeof addTimeoutToFunction;

export type AddTimeoutToFunctionReturnType<F extends AsyncFn> = (
  ...args: ExcludeLastFromTupleIfTimeoutArgs<Parameters<F>>
) => Promise<Awaited<ReturnType<F>>>;

export type AddTimeoutToFunctionParams<F extends AsyncFn> = Omit<
  _AddTimeoutToFunctionInternalParams<F>,
  "args"
>;

function _addTimeoutToFunctionInternal<F extends AsyncFn>({
  fn,
  args,
  timeout,
  cleanupFn,
  includeTimeoutArgs,
}: _AddTimeoutToFunctionInternalParams<F>): Promise<Awaited<ReturnType<F>>> {
  let timeoutCallback: () => void;
  let timeoutArgsOrUndefined;
  if (includeTimeoutArgs) {
    const setTimeoutCallback = (fn: FnWithNoArgs) => (timeoutCallback = fn);
    timeoutArgsOrUndefined = { setTimeoutCallback };
  }
  let timeoutId: number | NodeJS.Timeout | undefined;
  return Promise.race<ReturnType<F>>([
    fn(...args, timeoutArgsOrUndefined).then((result) => {
      clearTimeout(timeoutId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    }),
    new Promise<void>((_, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      timeoutId = setTimeout(async () => {
        reject(new TimeoutError("Function timed out"));
        cleanupFn && (await cleanupFn());
        timeoutCallback && timeoutCallback();
      }, timeout);
    }),
  ]);
}

type _AddTimeoutToFunctionInternalParams<F extends AsyncFn> = {
  fn: F;
  args: ExcludeLastFromTupleIfTimeoutArgs<Parameters<F>>;
  timeout: number;
  cleanupFn?: () => void | Promise<void>;
  includeTimeoutArgs?: boolean;
};

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}
