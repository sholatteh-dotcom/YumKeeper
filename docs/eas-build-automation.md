# Automated EAS Builds

## Purpose

This project includes a GitHub Actions workflow at [`.github/workflows/eas-build.yml`](../.github/workflows/eas-build.yml). It validates the YumKeeper application before requesting managed EAS cloud builds for **both iOS and Android**. The workflow is deliberately limited to build creation: it does not upload a build to App Store Connect or Google Play, publish an over-the-air update, or alter store listings.

| Trigger | Validation | EAS profile | Build scope | Intended use |
| --- | --- | --- | --- | --- |
| Pull request | TypeScript, 100%-threshold session-cookie coverage, no skipped tests, and Expo configuration | None | No store build | Safe code review feedback |
| Git tag beginning with `v` | TypeScript, 100%-threshold session-cookie coverage, no skipped tests, Expo configuration, and one approval gate | `production` | iOS `.ipa` and Android `.aab` | Versioned release candidate |
| Manual workflow dispatch | TypeScript, 100%-threshold session-cookie coverage, no skipped tests, Expo configuration, and one approval gate | Chosen `preview` or `production` profile | Android, iOS, or both | Controlled test or release build |

> **Release safeguard:** Production builds are triggered only by a version-style tag such as `v1.0.2` or by a deliberate manual run. Protect the `production` GitHub environment to require an approval before EAS receives a production build request.

> **Coverage safeguard:** The workflow runs `pnpm test:coverage`, which executes the complete Vitest suite and requires 100% statements, branches, functions, and lines for the session-cookie policy module. It rejects `describe.skip`, `it.skip`, and `test.skip` declarations under `tests/`, then retains the machine-readable LCOV and JSON summary as a 14-day workflow artifact.

## Current YumKeeper EAS configuration

The repository is already linked to EAS project `369cf431-4f4b-4518-ac98-dfa01d9b90a6`. The production profile in `eas.json` uses remote credentials, produces an Android App Bundle, enables automatic build-number incrementing, and targets the `production` update channel. The application identifiers are:

| Platform | Identifier | Production artifact |
| --- | --- | --- |
| iOS | `com.yumkeeper.app` | Signed `.ipa` for App Store Connect/TestFlight |
| Android | `com.yumkeeper.app` | Signed `.aab` for Google Play |

## One-time setup

### 1. Complete interactive EAS credentials once

EAS build requests from CI are non-interactive. Before enabling tag builds, complete the current interactive iOS credentials flow by choosing **Generate new Apple Provisioning Profile** after the Apple Distribution Certificate is created. Then confirm that this succeeds at least once from a trusted local terminal:

```bash
eas build --platform ios --profile production
```

For Android, complete a first production build with the intended remote credentials:

```bash
eas build --platform android --profile production
```

If YumKeeper is updating an existing Google Play listing, the remote EAS keystore must be the original Google Play upload key, or the listing must use an approved Play App Signing upload-key reset. A new EAS keystore cannot update a listing that expects a different upload certificate.

### 2. Mirror the repository to GitHub

This current project remote is managed by the development platform, rather than GitHub. GitHub Actions begins only after this repository is pushed or mirrored to a GitHub repository. Add the workflow file in this repository to that GitHub repository before relying on tag builds.

### 3. Create the Expo access-token secret

Create a dedicated Expo personal access token at [Expo account access tokens](https://expo.dev/accounts/settings/access-tokens). In the GitHub repository, open **Settings → Secrets and variables → Actions**, then create a repository secret named:

```text
EXPO_TOKEN
```

Paste the token only into the GitHub secret value. Do not place it in `eas.json`, an `.env` file, source code, build logs, or chat. Use a token owned by an Expo account that has access to the YumKeeper EAS project, and revoke/rotate it if a maintainer leaves the release team.

### 4. Protect release environments and tags

In **Settings → Environments**, create environments named `preview` and `production`. For `production`, add the appropriate required reviewer(s) and limit deployment branches/tags to protected release tags where available. The workflow’s single approval job uses these environment names before either platform build is requested.

Also protect the GitHub repository’s release-tag namespace (`v*`) so only authorized release maintainers can create tags that cause production builds.

## Operating the workflow

### Create a production build from a release tag

Before creating a new release tag, update the human-readable app version in `app.config.ts` and release notes. From a clean, reviewed Git commit in the GitHub repository:

```bash
git tag -a v1.0.2 -m "YumKeeper v1.0.2"
git push origin v1.0.2
```

The tag triggers validation, waits at the `production` environment gate, then asks EAS to start independent iOS and Android production builds. Each workflow job prints the EAS build URL; use it to review build progress and download artifacts when EAS completes.

### Start a build manually

1. Open the GitHub repository’s **Actions** tab.
2. Select **EAS Build**.
3. Select **Run workflow**.
4. Choose the target platform (`all`, `android`, or `ios`) and build profile (`preview` or `production`).
5. Approve the selected environment if the repository has protection rules.

The `preview` profile is for internal distribution. On iOS it may require an Ad Hoc provisioning profile containing any test devices that should install the build. Use `production` for TestFlight/App Store and Play-ready artifacts.

## What is and is not automated

| Activity | Included | Reason |
| --- | --- | --- |
| TypeScript and test validation | Yes | Prevents known application failures from reaching EAS. |
| Expo configuration validation | Yes | Confirms the committed configuration can be resolved. |
| iOS and Android EAS build requests | Yes | Creates managed, signed cloud build jobs. |
| Apple/Google store submission | No | Store submission remains an explicit release decision and requires complete store configuration. |
| EAS credential generation or repair | No | Apple and Android credential setup may require interactive platform authorization. |
| Google Play service-account key handling | No | The sensitive JSON key remains local and ignored by Git. |

Before automating iOS submission, create the YumKeeper App Store Connect record for `com.yumkeeper.app` and replace the `ascAppId` placeholder in `eas.json` with its numeric Apple ID. Before automating Android submission, configure the Google Play service account as described in [Google Play Service Account Setup](google-play-service-account-setup.md). Keep those actions separate from this build-only workflow until the first manual store submissions are verified.

## Troubleshooting

| Symptom | Likely cause | Resolution |
| --- | --- | --- |
| `Unauthorized` or login failure | `EXPO_TOKEN` is absent, invalid, expired, or lacks project access | Replace the GitHub secret with a current token from an authorized Expo account. |
| iOS CI build says credentials are missing | The first interactive signing setup was not completed | Finish the Apple certificate/provisioning-profile flow and complete one manual production build. |
| iOS preview build fails on provisioning | No eligible Ad Hoc profile or registered device | Register the test device and refresh the Ad Hoc profile, or select the production profile for a TestFlight build. |
| Android upload later reports a wrong signing key | The existing Play listing expects the original upload certificate | Restore the original upload key in EAS or complete Google Play’s upload-key reset process. |
| A tag does not start a build | The code was not pushed to the GitHub repository, the tag does not begin with `v`, or Actions is disabled | Push the workflow and tag to GitHub, use a tag such as `v1.0.2`, and verify repository Actions permissions. |

## Security checklist

- [ ] `EXPO_TOKEN` exists only as a GitHub Actions secret.
- [ ] The Apple `.p8` key, Android `.jks`/`.keystore`, provisioning profiles, and Google service-account JSON are never committed.
- [ ] The `production` GitHub environment requires release-team approval.
- [ ] Release tags are protected.
- [ ] The GitHub repository plan supports required status checks or rulesets; configure **Validate application** as a required main-branch check after the project workflow is mirrored to GitHub.
- [ ] The first iOS and Android production builds have been verified interactively before CI is enabled.
- [ ] App Store Connect and Google Play submissions remain deliberate, reviewed actions.
