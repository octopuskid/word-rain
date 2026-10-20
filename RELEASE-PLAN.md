# Pending Android release

## Current publication state

- GitHub HTML/GitHub Pages: 1.6.0, explicitly marked **this ver is not verified**.
- itch.io: leave at 1.5.3; do not upload this unverified HTML there.
- Published Full/Lite APK: 1.5.3 (version code 28).
- Skip APK version 1.6.0.

## Next user message

At the next user message, check whether the execution workspace is available. If it is available, build and test fresh Full/Lite APKs as **1.6.1**, with a version code greater than 28 (use 30, reserving the unreleased 29). If the workspace is still unavailable, report the blocker; do not claim a build or release.

Use the original app ID, release signing certificate and storage keys so in-place updates preserve records. Never replace the signing identity with a new or debug key. The private signing material belongs in its existing private location, never in this repository.

Bring in the rewritten source and Android changes from `rebuild/1.6.0`, including hiding BGM/SFX on Word Stats and restoring them on Game without resuming. Update version metadata to 1.6.1 before building. Preserve this main branch's HTML release notice and documentation until testing is actually complete; reconcile current files rather than overwrite main from the old branch.

Run mode-specific wrong-letter, shield, scoring-pause, Overcast settings/geometry/handwriting and Stats visibility tests, plus existing regression suites. Verify both APK signatures match earlier releases. Only remove the unverified notice after meaningful runtime/device verification.

The last explicit instruction is GitHub-only for the unverified 1.6.0 HTML. Do not publish 1.6.0 on itch.io. Future verified gameplay releases otherwise follow the user's established synchronized HTML/APK/instructions workflow, subject to any new instruction in their next message.
