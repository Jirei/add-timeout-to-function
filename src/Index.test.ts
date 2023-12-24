import { expect, test, describe, vi } from "vitest";
import { TimeoutError, addTimeoutToFunction } from ".";


describe("basic functionalities", () => {
  test("returns the function response if function execution ends before the timeout", async () => {
    await expect(addTimeoutToFunction(() => returnSumAfterSpecifiedTime(1, 2, 100), 1000)).resolves.toEqual(3);
  });

  test("throws error if function execution ends after the timeout", async () => {
    await expect(addTimeoutToFunction(() => returnSumAfterSpecifiedTime(1, 2, 500), 100)).rejects.toThrowError();
  });

  test("thrown error if function execution ends after the timeout has correct type & name", async () => {
    await expect(addTimeoutToFunction(() => returnSumAfterSpecifiedTime(1, 2, 500), 100)).rejects.toBeInstanceOf(TimeoutError);
    await expect(addTimeoutToFunction(() => returnSumAfterSpecifiedTime(1, 2, 500), 100)).rejects.toThrowError("Function timed out");
  });

  test("throws the original function error if the function has an error before the timeout", async () => {
    await expect(addTimeoutToFunction(() => returnSumAfterSpecifiedTime(1, 2, 500, true), 100)).rejects.toThrowError("Function had a(n) (simulated) error");
  });
});

async function returnSumAfterSpecifiedTime(a: number, b: number, time: number, shouldThrowError = false) {
  if (shouldThrowError) throw new Error("Function had a(n) (simulated) error");
  return new Promise((resolve, _) => setTimeout(() => resolve(a + b), time));
}

describe("hasTimedOut functionality tests", () => {
  test("correctly communicate if the timeout has expired with the provided hasTimedOut function", async () => {
    await addTimeoutToFunction((hasTimedOut) => hasTimedOutReturnCorrectValues(500, 300, hasTimedOut), 1000);
  });
});

async function hasTimedOutReturnCorrectValues(timeout: number, beforeTimeout: number, hasTimedOut: (() => boolean) | undefined) {
  if (!hasTimedOut) throw new Error("hasTimedOut should have been provided for this function");
  setTimeout(() => expect(hasTimedOut()).toEqual(false), timeout - beforeTimeout);
  await wait(timeout + 100);
  () => expect(hasTimedOut()).toEqual(true);

}

describe("cleanup functionality tests", () => {
  test("correctly call cleanup function if timeout", async () => {
    const cleanupFnMock = vi.fn().mockResolvedValue(1);
    await expect(() => addTimeoutToFunction(async () => await wait(1000), 100, () => cleanupFnMock())).rejects.toThrowError();
    expect(cleanupFnMock).toHaveBeenCalledOnce();
    expect(cleanupFnMock).toHaveNthReturnedWith(1,1)
  });
  test("correctly doesn't call cleanup function if timeout didn't expire", async () => {
    const cleanupFnMock = vi.fn();
    expect(() => addTimeoutToFunction(async () => await wait(100), 1000, () => cleanupFnMock()));
    expect(cleanupFnMock).not.toBeCalled();
  });
});

export async function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}