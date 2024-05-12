import { test, describe, vi, beforeEach, afterEach } from "vitest";
import { wait } from "wait-util";
import { getExactStringRegex, testWithContext } from "../helpers";
import { type TimeoutError, type AddTimeoutToFunction } from "@/index";

//  You need to test like that with the fake timers to avoid having vitest tell you that you have unhandled errors, could change in the future:
//  1) Construct the expects but don't await them.
//  const expect1 = expect(result).rejects.not.toBeInstanceOf(TimeoutError);
//  const expect2 = expect(result).rejects.toThrowError(
//    getExactStringRegex("Function had a(n) (simulated) error"),
//  );
//  2) Advance the fake timers
//  await vi.advanceTimersByTimeAsync(1000);
//  3) Await the expects
//  await expect1;
//  await expect2;

export function addTimeoutToFunctionTestsFactory(
  addTimeoutToFunction: AddTimeoutToFunction,
  timeoutError: typeof TimeoutError,
) {
  return () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
    describe.sequential("basic functionalities", () => {
      testWithContext(
        "returns the function response if function execution ends before the timeout",
        async ({ asyncAdd, expect }) => {
          expect.assertions(1);
          const asyncAddDecoratedWithTimeout = addTimeoutToFunction({
            fn: asyncAdd,
            timeout: 1000,
          });
          const result = asyncAddDecoratedWithTimeout({
            a: 1,
            b: 2,
            delay: 100,
            shouldThrowError: false,
          });
          const expect1 = expect(result).resolves.toBe(3);
          await vi.advanceTimersByTimeAsync(1100);
          await expect1;
        },
      );

      testWithContext(
        "throws timeout error if function execution ends after the timeout and thrown error has correct type & description",
        async ({ asyncAdd, expect }) => {
          expect.assertions(2);
          const asyncAddDecoratedWithTimeout = addTimeoutToFunction({
            fn: asyncAdd,
            timeout: 100,
          });
          const result = asyncAddDecoratedWithTimeout({
            a: 1,
            b: 2,
            delay: 500,
            shouldThrowError: false,
          });
          const expect1 = expect(result).rejects.toBeInstanceOf(timeoutError);
          const expect2 = expect(result).rejects.toThrow(
            getExactStringRegex("Function timed out"),
          );
          await vi.advanceTimersByTimeAsync(200);
          await expect1;
          await expect2;
        },
      );

      testWithContext(
        "throws the original function error if the function has an error before the timeout",
        async ({ asyncAdd, expect }) => {
          expect.assertions(2);
          const asyncAddDecoratedWithTimeout = addTimeoutToFunction({
            fn: asyncAdd,
            timeout: 100,
          });
          const result = asyncAddDecoratedWithTimeout({
            a: 1,
            b: 2,
            delay: 500,
            shouldThrowError: true,
          });
          const expect1 =
            expect(result).rejects.not.toBeInstanceOf(timeoutError);
          const expect2 = expect(result).rejects.toThrowError(
            getExactStringRegex("Function had a(n) (simulated) error"),
          );
          await vi.advanceTimersByTimeAsync(1000);
          await expect1;
          await expect2;
        },
      );
    });

    describe.sequential("timeout callback functionalities", () => {
      testWithContext(
        "correctly register the timeout callback within the target function",
        async ({ asyncAdd, expect }) => {
          expect.assertions(3);
          const asyncAddDecoratedWithTimeout = addTimeoutToFunction({
            fn: asyncAdd,
            timeout: 100,
            includeTimeoutArgs: true,
          });
          const timeoutCallbackMock = vi.fn();
          const expect1 = expect(
            asyncAddDecoratedWithTimeout({
              a: 1,
              b: 2,
              delay: 1000,
              shouldThrowError: false,
              timeoutCallback: () => void timeoutCallbackMock(1, 2),
            }),
          ).rejects.toThrowError();
          // Need to wait so that the timeout callback fn has time to run before checking things
          await vi.advanceTimersByTimeAsync(500);
          await expect1;
          const _expect2 = expect(timeoutCallbackMock).toHaveBeenCalledOnce();
          const _expect3 = expect(timeoutCallbackMock).toHaveBeenCalledWith(
            1,
            2,
          );
        },
      );
      testWithContext(
        "correctly doesn't call timeout callback function if timeout didn't expire",
        async ({ asyncAdd, expect }) => {
          expect.assertions(2);
          const asyncAddDecoratedWithTimeout = addTimeoutToFunction({
            fn: asyncAdd,
            timeout: 1000,
            includeTimeoutArgs: true,
          });
          const timeoutCallbackMock = vi.fn();
          const result = asyncAddDecoratedWithTimeout({
            a: 1,
            b: 2,
            delay: 100,
            shouldThrowError: false,
            timeoutCallback: () => void timeoutCallbackMock(1, 2),
          });
          const expect1 = expect(result).resolves.toBe(3);
          await vi.advanceTimersByTimeAsync(150);
          await expect1;
          const _expect2 =
            expect(timeoutCallbackMock).not.toHaveBeenCalledOnce();
        },
      );
    });

    describe.sequential("cleanup functionalities", () => {
      test("correctly call cleanup function if timeout", async ({ expect }) => {
        expect.assertions(3);
        const cleanupFnMock = vi.fn();
        const asyncWaitDecoratedWithTimeout = addTimeoutToFunction({
          fn: async () => await wait(1000),
          timeout: 100,
          cleanupFn: () => void cleanupFnMock(1, 2),
        });
        const result = asyncWaitDecoratedWithTimeout();
        const expect1 = expect(result).rejects.toThrowError();
        // Need to wait so that the timeout callback fn has time to run before checking things
        await vi.advanceTimersByTimeAsync(100);
        await expect1;
        const _expect2 = expect(cleanupFnMock).toHaveBeenCalledOnce();
        const _expect3 = expect(cleanupFnMock).toHaveBeenCalledWith(1, 2);
      });
      test("correctly doesn't call cleanup function if timeout didn't expire", async ({
        expect,
      }) => {
        expect.assertions(2);
        const cleanupFnMock = vi.fn();
        const asyncWaitDecoratedWithTimeout = addTimeoutToFunction({
          fn: async () => {
            await wait(100);
            return 1;
          },
          timeout: 1000,
          cleanupFn: () => void cleanupFnMock(),
        });
        const result = asyncWaitDecoratedWithTimeout();
        const expect1 = expect(result).resolves.toBe(1);
        await vi.advanceTimersByTimeAsync(2000);
        await expect1;
        const _expect2 = expect(cleanupFnMock).not.toBeCalled();
      });
    });
  };
}
