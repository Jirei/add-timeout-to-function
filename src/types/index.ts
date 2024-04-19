// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncFn = (...args: any[]) => Promise<any>;
export type FnWithNoArgs = () => unknown;

export type TimeoutArgs = {
  setTimeoutCallback: (fn: FnWithNoArgs) => FnWithNoArgs;
};

export type ExcludeFromTuple<T extends readonly unknown[], E> = T extends [
  infer F,
  ...infer R,
]
  ? [F] extends [E]
    ? ExcludeFromTuple<R, E>
    : [F, ...ExcludeFromTuple<R, E>]
  : [];

export type ExcludeLastFromTupleIfTimeoutArgs<T extends readonly unknown[]> =
  T extends [...infer F, infer R] ? ([R] extends [TimeoutArgs] ? F : T) : T;
