import { simpleGit } from "simple-git";
import semver from "semver";

export const gitClient = simpleGit();

export async function getAllTags() {
  return (await gitClient.tags()).all;
}

export async function getRegularReleaseTags() {
  return (await getAllTags())
    .filter((tag) => semver.valid(tag))
    .filter((tag) => !tag.includes("-"));
}

export async function getGreatestRegularReleaseTag() {
  return semver.rsort(await getRegularReleaseTags())[0];
}

export async function isRegularVersionNextToGreatestRegularRelease(
  version: string,
): Promise<{ isOk: boolean; acceptableVersions?: (string | null)[] }> {
  const releasesTypes: semver.ReleaseType[] = ["patch", "minor", "major"];
  const greatestRegularRelease = await getGreatestRegularReleaseTag();
  const acceptableVersions = releasesTypes.map((releaseType) =>
    semver.inc(greatestRegularRelease, releaseType),
  );
  if (version.includes("-")) return { isOk: false, acceptableVersions };
  const isOk = releasesTypes.some(
    (releaseType) =>
      semver.inc(greatestRegularRelease, releaseType) ===
      semver.coerce(version)?.version,
  );
  if (isOk) return { isOk: true };
  return { isOk: false, acceptableVersions };
}

export function createPrereleaseVersionFromRegularVersionWithoutIncrementing(
  version: string,
  preid: string,
): string {
  if (version.includes("-") || !semver.valid(version)) {
    throw new Error("Invalid version string.");
  }
  return version + "-" + preid + ".0";
}

export function incrementPrereleaseVersion(version: string) {
  if (!version.includes("-") || !semver.valid(version)) {
    throw new Error("The provided prerelease version isn't valid.");
  }
  const incrementedVersion = semver.inc(version, "prerelease");
  if (!incrementedVersion) {
    throw new Error("Failed to increment version.");
  }
  return incrementedVersion;
}
