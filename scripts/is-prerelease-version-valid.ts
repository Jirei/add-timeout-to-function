import { isVersionNextToGreatestRegularRelease } from "./utils.ts";
import packageJson from "../package.json";
const result = await isVersionNextToGreatestRegularRelease(packageJson.version);

if (result.isOk) {
  console.log("Version is valid.");
} else {
  throw new Error(
    "Package version invalid. Acceptable versions (for the prerelease to be based of):\n" +
      result.acceptableVersions?.join("\n") +
      "\n",
  );
}
