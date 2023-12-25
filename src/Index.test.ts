import { expect, test, describe, vi } from "vitest";
import { TimeoutArgs, TimeoutError, addTimeoutToFunction } from ".";


describe("basic functionalities", () => {
  test("returns the function response if function execution ends before the timeout", async () => {
    const returnSumAfterSpecifiedTimeWithTimeout = addTimeoutToFunction({ fn: returnSumAfterSpecifiedTime, timeout: 1000 });
    await expect(returnSumAfterSpecifiedTimeWithTimeout({ a: 1, b: 2, time: 100, shouldThrowError: false })).resolves.toEqual(3);
  });
  test("throws error if function execution ends after the timeout", async () => {
    const returnSumAfterSpecifiedTimeWithTimeout = addTimeoutToFunction({ fn: returnSumAfterSpecifiedTime, timeout: 100 });
    await expect(returnSumAfterSpecifiedTimeWithTimeout({ a: 1, b: 2, time: 500, shouldThrowError: false })).rejects.toThrowError();
  });

  test("thrown error if function execution ends after the timeout has correct type & name", async () => {
    const returnSumAfterSpecifiedTimeWithTimeout = addTimeoutToFunction({ fn: returnSumAfterSpecifiedTime, timeout: 100 });
    await expect(returnSumAfterSpecifiedTimeWithTimeout({ a: 1, b: 2, time: 500, shouldThrowError: false })).rejects.toBeInstanceOf(TimeoutError);
    await expect(returnSumAfterSpecifiedTimeWithTimeout({ a: 1, b: 2, time: 500, shouldThrowError: false })).rejects.toThrowError("Function timed out");
  });

  test("throws the original function error if the function has an error before the timeout", async () => {
    const returnSumAfterSpecifiedTimeWithTimeout = addTimeoutToFunction({ fn: returnSumAfterSpecifiedTime, timeout: 100 });
    await expect(returnSumAfterSpecifiedTimeWithTimeout({ a: 1, b: 2, time: 500, shouldThrowError: true })).rejects.toThrowError("Function had a(n) (simulated) error");
  });
});

async function returnSumAfterSpecifiedTime({ a, b, time, shouldThrowError = false }: { a: number, b: number, time: number, shouldThrowError: boolean; }, timeoutArgs?: TimeoutArgs) {
  if (shouldThrowError) throw new Error("Function had a(n) (simulated) error");
  if (timeoutArgs) timeoutArgs.setHandleHasTimedOut(() => () => `I cleaned up from within, a and b are: ${a},${b}`);
  return new Promise<number>((resolve, _) => setTimeout(() => resolve(a + b), time));
}

describe("setHandleHasTimedOut functionality tests", () => {
  test("correctly register the function to handle timeout within the target function", async () => {
    const returnSumAfterSpecifiedTimeWithTimeout = addTimeoutToFunction({ fn: returnSumAfterSpecifiedTime, timeout: 100, shouldProvideTimeoutArgs: true });

  });
});

// describe("cleanup functionality tests", () => {
//   test("correctly call cleanup function if timeout", async () => {
//     const cleanupFnMock = vi.fn().mockResolvedValue(1);
//     await expect(() => addTimeoutToFunction({ fn: async () => await wait(1000), timeout: 100, cleanupFn: () => cleanupFnMock() })()).rejects.toThrowError();
//     expect(cleanupFnMock).toHaveBeenCalledOnce();
//     expect(cleanupFnMock).toHaveNthReturnedWith(1, 1);
//   });
//   test("correctly doesn't call cleanup function if timeout didn't expire", async () => {
//     const cleanupFnMock = vi.fn();
//     expect(() => addTimeoutToFunction(async () => await wait(100), 1000, () => cleanupFnMock()));
//     expect(cleanupFnMock).not.toBeCalled();
//   });
// });

export async function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}