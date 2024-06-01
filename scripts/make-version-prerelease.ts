import { writeFileSync } from "fs";
import packageJson from "../package.json";
import { createPrereleaseVersionFromRegularVersionWithoutIncrementing } from "./utils";
import path from "path";

packageJson.version =
  createPrereleaseVersionFromRegularVersionWithoutIncrementing(
    packageJson.version,
    "beta",
  );
writeFileSync(
  path.resolve(__dirname, "../package.json"),
  JSON.stringify(packageJson),
);
