import { isVersionNextToGreatestRegularRelease } from "./utils.ts";
import packageJson from "../package.json";
const result = await isVersionNextToGreatestRegularRelease(packageJson.version);

if (result.isOk) {
  console.log("Version is valid.");
} else {
  throw new Error(
    "Package version invalid. Acceptable versions:\n" +
      result.acceptableVersions?.join("\n") +
      "\n",
  );
}
