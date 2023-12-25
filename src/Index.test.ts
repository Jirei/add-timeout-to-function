import { expect, test, describe, vi } from "vitest";
import { FnWithNoArgs, TimeoutArgs, TimeoutError, addTimeoutToFunction } from ".";


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

async function returnSumAfterSpecifiedTime({ a, b, time, shouldThrowError = false, handleTimedOut }: { a: number, b: number, time: number, shouldThrowError: boolean; handleTimedOut?: FnWithNoArgs; }, timeoutArgs: TimeoutArgs) {
  if (shouldThrowError) throw new Error("Function had a(n) (simulated) error");
  if (handleTimedOut) timeoutArgs.setHandleHasTimedOut(handleTimedOut);
  return new Promise<number>((resolve, _) => setTimeout(() => resolve(a + b), time));
}

describe("setHandleHasTimedOut functionality tests", () => {
  test("correctly register the function to handle timeout within the target function", async () => {
    const returnSumAfterSpecifiedTimeWithTimeout = addTimeoutToFunction({ fn: returnSumAfterSpecifiedTime, timeout: 100, shouldProvideTimeoutArgs: true });
    const fn = vi.fn((a, b) => a + b);
    expect(returnSumAfterSpecifiedTimeWithTimeout({ a: 1, b: 2, time: 1000, shouldThrowError: false, handleTimedOut: () => fn(1, 2) })).rejects.toThrowError();
    // Need to wait so that the onTimedOut fn has time to run before checking things
    await wait(100);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(1, 2);
  });
});

describe("cleanup functionality tests", () => {
  test("correctly call cleanup function if timeout", async () => {
    const cleanupFnMock = vi.fn();
    await expect(() => addTimeoutToFunction({ fn: async () => await wait(1000), timeout: 100, cleanupFn: () => cleanupFnMock() })()).rejects.toThrowError();
    expect(cleanupFnMock).toHaveBeenCalledOnce();
  });
  test("correctly doesn't call cleanup function if timeout didn't expire", async () => {
    const cleanupFnMock = vi.fn();
    expect(() => addTimeoutToFunction({ fn: async () => await wait(100), timeout: 1000, cleanupFn: () => cleanupFnMock() }));
    expect(cleanupFnMock).not.toBeCalled();
  });
});

export async function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}