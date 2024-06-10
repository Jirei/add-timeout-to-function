import { writeFileSync } from "fs";
import packageJson from "../package.json";
import path from "path";
import * as prettier from "prettier";
packageJson.version = packageJson.version.split("-")[0];
console.log(packageJson.version);
writeFileSync(
  path.resolve(import.meta.dirname, "../package.json"),
  await prettier.format(JSON.stringify(packageJson), {
    filepath: "../package.json",
  }),
);
