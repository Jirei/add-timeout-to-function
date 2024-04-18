export type AsyncFn = (...args: any[]) => Promise<any>;
export type FnWithNoArgs = () => any;

export type TimeoutArgs = {
  setTimeoutCallback: (fn: FnWithNoArgs) => FnWithNoArgs;
};

export type ExcludeFromTuple<T extends readonly any[], E> = T extends [
  infer F,
  ...infer R,
]
  ? [F] extends [E]
    ? ExcludeFromTuple<R, E>
    : [F, ...ExcludeFromTuple<R, E>]
  : [];

export type ExcludeLastFromTupleIfTimeoutArgs<T extends readonly any[]> =
  T extends [...infer F, infer R] ? ([R] extends [TimeoutArgs] ? F : T) : T;
