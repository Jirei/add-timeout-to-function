import { describe } from "vitest";
import { addTimeoutToFunctionTestsFactory } from "./suites/add-timeout-to-function.test-suite";
import { addTimeoutToFunction, TimeoutError } from "add-timeout-to-function";

describe(
  "addTimeoutToFunction Build",
  addTimeoutToFunctionTestsFactory(addTimeoutToFunction, TimeoutError),
);
