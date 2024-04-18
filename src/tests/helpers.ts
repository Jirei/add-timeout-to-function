import { test } from "vitest";
import { FnWithNoArgs, TimeoutArgs } from "../types";
import { escapeRegExp } from "lodash-es";

interface TestWithContextFixtures {
  asyncAdd: typeof asyncAdd;
}

export const testWithContext = test.extend<TestWithContextFixtures>({
  asyncAdd: async ({}, use) => {
    await use(asyncAdd);
  },
});

async function asyncAdd(
  { a, b, delay, shouldThrowError = false, timeoutCallback }: AsyncAddOwnParams,
  timeoutArgs: TimeoutArgs,
) {
  if (shouldThrowError) throw new Error("Function had a(n) (simulated) error");
  if (timeoutCallback) timeoutArgs.setTimeoutCallback(timeoutCallback);
  return new Promise<number>((resolve, _) =>
    setTimeout(() => resolve(a + b), delay),
  );
}

type AsyncAddOwnParams = {
  a: number;
  b: number;
  delay: number;
  shouldThrowError: boolean;
  timeoutCallback?: FnWithNoArgs;
};

export function getExactStringRegex(exactString: string) {
  const escapedExactString = escapeRegExp(exactString);
  return new RegExp(`^${escapedExactString}$`);
}
