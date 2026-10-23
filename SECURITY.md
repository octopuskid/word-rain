# Security policy

Word Rain is a free, open-source HTML arcade game with an Android wrapper. This policy covers security vulnerabilities in the official project, its distributed builds and its publishing infrastructure.

## Supported versions

Security fixes target the latest stable release and the current development source on `main`.

| Version / channel | Security maintenance |
| --- | --- |
| Latest stable HTML — currently **1.7.0**; Android **1.6.8** pending signing-key recovery | Primary stable target for security fixes |
| Current `main` / future development prereleases | Reports accepted; fixes may appear here before a stable release |
| Older releases, archived HTML and retired Full/Lite editions | No guaranteed backports; update to the latest stable version |

Version examples are a snapshot as of **23 October 2026**. Consult [Releases](https://github.com/octopuskid/word-rain/releases) for the current stable and prerelease versions. A development build is not a stable security upgrade merely because its version number is newer. A newly published stable release supersedes the previous stable version for ongoing maintenance.

Please report a suspected vulnerability even if you first found it in an older version; include whether it also affects a supported version.

## Report a vulnerability privately

Use GitHub's **private vulnerability reporting**:

1. Open [Security → Advisories](https://github.com/octopuskid/word-rain/security/advisories).
2. Choose **Report a vulnerability** and submit a private report to the maintainers. A GitHub account may be required.

**Do not publish an exploitable vulnerability in a public issue, pull request, wiki edit or social post.** Ordinary gameplay bugs, balance feedback and feature requests can use [GitHub Issues](https://github.com/octopuskid/word-rain/issues).

If the private reporting control is unavailable, a public issue may ask the maintainer to restore the private reporting channel, without describing the vulnerability or attaching sensitive material. There is currently no separate security email address advertised by this policy.

### Include in the report

- A short description and the realistic security impact.
- Affected version or commit, download source, and whether it is the APK, standalone HTML, GitHub Pages game or test lab.
- Device/Android version or browser version, as relevant.
- Minimal steps to reproduce, expected behavior and actual behavior.
- A small proof of concept, sanitized logs or screenshots when helpful.
- Whether user interaction, a local file, network access or unusual configuration is required.
- A suggested fix, if you have one; this is optional.

Do not include passwords, session cookies, tokens, signing keys, unrelated personal data or other people's files. Redact secrets from logs. For an exposed credential, privately identify its location without copying its value.

## Security scope

Examples of relevant security concerns include:

- Android WebView origin isolation, navigation restrictions and access to the native JavaScript bridge.
- Unauthorized access to local files, selected audio documents, saved records or the private optional-music cache.
- Bypassing consent or integrity checks for optional music downloads, or unsafe handling of downloaded content.
- Update-check or release-handling behavior that could direct players to an unintended download or installation source.
- Script injection or execution with impact beyond the intended game or test-lab controls.
- Compromised release assets, exposed credentials/signing material, or vulnerabilities in build and publishing workflows.
- Dependencies with a demonstrated security impact on the game, Android packaging or build tooling.

The test lab deliberately permits custom words, manual drops, HP edits and shield/speed adjustments. Changing your own score, local settings or test-run state through intended controls or developer tools is not by itself a security vulnerability. The project has no competitive online leaderboard or server account system.

General gameplay errors and crashes are usually ordinary bug reports; a crash with a security impact, such as a resource-exhaustion or isolation issue, can be reported privately.

For vulnerabilities in GitHub, itch.io, a browser, Android or another third-party service itself, use that provider's reporting process. Report Word Rain's own insecure integration here.

## Responsible testing and disclosure

Test on your own device, local checkout or other environment you control. Use the smallest proof of concept needed to demonstrate the issue. Do not access other people's data, disrupt public services, run destructive tests against production, or upload malware. Stop and report privately if testing unexpectedly exposes sensitive data.

Keep details private while maintainers investigate and coordinate a fix. Maintainers may ask for clarification, reproduce the issue, assess affected versions and prepare a patch. Public disclosure and an advisory can be coordinated after a fix or mitigation is available.

This is a small volunteer project: there is no guaranteed acknowledgement or remediation deadline and no paid bug bounty. This policy does not grant permission to test third-party systems or override their terms.

## Updates and player data

Obtain builds through the [official GitHub releases](https://github.com/octopuskid/word-rain/releases), [GitHub Pages game](https://octopuskid.github.io/word-rain/) or [itch.io page](https://octopuskid.itch.io/word-rain). Review release notes and any published security advisories.

The Android app's current stable update check runs once per fresh launch and opens the release page; it does not silently install updates. If that check cannot run, inspect the official release page manually. Install a compatible signed APK over the existing app to preserve local records; uninstalling or clearing app data can remove them.

Appearance settings, unlocks and Android records are stored locally. Optional downloads, update checks and the public web visit counter make network requests; providers receive normal request metadata. Local music selection does not upload the selected file. See the [player wiki](https://github.com/octopuskid/word-rain/wiki/Test-Mode-and-Platform-Features) for platform behavior and privacy details.
