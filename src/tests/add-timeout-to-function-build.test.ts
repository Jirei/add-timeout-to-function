import { describe } from "vitest";
import { addTimeoutToFunctionTestsFactory } from "./suites/add-timeout-to-function.test-suite";
import {
  addTimeoutToFunction,
  TimeoutError,
} from "@local-build/add-timeout-to-function";

describe(
  "addTimeoutToFunction Build",
  addTimeoutToFunctionTestsFactory(addTimeoutToFunction, TimeoutError),
);
