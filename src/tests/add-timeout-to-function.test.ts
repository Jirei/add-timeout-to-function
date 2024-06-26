import { describe } from "vitest";
import { addTimeoutToFunctionTestsFactory } from "./suites/add-timeout-to-function.test-suite";
import { addTimeoutToFunction } from "@/index";
import { TimeoutError } from "@/index";

describe(
  "addTimeoutToFunction",
  addTimeoutToFunctionTestsFactory(addTimeoutToFunction, TimeoutError),
);
