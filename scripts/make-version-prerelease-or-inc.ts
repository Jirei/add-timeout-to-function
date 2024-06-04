import { writeFileSync } from "fs";
import packageJson from "../package.json";
import {
  createPrereleaseVersionFromRegularVersionWithoutIncrementing,
  doesVersionHavePrerelease,
  incrementPrereleaseVersion,
} from "./utils";
import path from "path";
import * as prettier from "prettier";

let newVersion;
if (await doesVersionHavePrerelease(packageJson.version)) {
  newVersion = incrementPrereleaseVersion(packageJson.version);
} else {
  newVersion = createPrereleaseVersionFromRegularVersionWithoutIncrementing(
    packageJson.version,
    "beta",
  );
}
packageJson.version = newVersion;
console.log(newVersion);
writeFileSync(
  path.resolve(import.meta.dirname, "../package.json"),
  await prettier.format(JSON.stringify(packageJson), {
    filepath: "../package.json",
  }),
);
