import { writeFileSync } from "fs";
import packageJson from "../package.json";
import { createPrereleaseVersionFromRegularVersionWithoutIncrementing } from "./utils";
import path from "path";
import * as prettier from "prettier";

packageJson.version =
  createPrereleaseVersionFromRegularVersionWithoutIncrementing(
    packageJson.version,
    "beta",
  );
writeFileSync(
  path.resolve(import.meta.dirname, "../package.json"),
  await prettier.format(JSON.stringify(packageJson), {
    filepath: "../package.json",
  }),
);
