# HTML build and size optimization

Stable **1.6.4** promotes development builds 1.6.3.1–1.6.3.3, including purple paper wildcard tiles, a short intro and Quick rules. Its HTML is 82,552 bytes.
The downloadable HTML falls from 99,248 to 81,887 bytes: **17.5% smaller**.
The shorter intro and expandable Quick rules in 1.6.3.2 bring its file to 82,516 bytes.
No network loader, packed-code evaluator or gameplay feature removal is used.

## Build

Edit `src/index.html`, the readable source. Run `npm ci` then `npm run build`.
This regenerates `index.html` and the matching versioned HTML file byte-for-byte.
Keep the stable `word-rain-1.6.3.html` as an archive.
The package lock pins the development build dependencies; they are not shipped
or needed to play the game.

The generated file is self-contained: open it offline, or host it using
[HOSTING.md](HOSTING.md). The original synthesized music and sound effects,
handwriting font, and both cloud textures remain inside it.
Optional Kevin MacLeod recordings remain separate consent-based downloads.

## What changed

- Remove comments and unnecessary whitespace in the delivered file; conservatively
  minify styles and scripts. Preserve global function names, native callbacks,
  DOM IDs, accessibility labels and local-storage keys.
- Reference each repeated cloud path once inside its embedded SVG. All path
  coordinates, transforms, fills, strokes and layer order are preserved.
- Encode SVG data URLs without escaping characters that are safe inside the
  quoted CSS URL. No cloud image pixels are discarded.
- Repack the embedded WOFF handwriting font as WOFF2. Glyph outlines, spacing
  and character mappings remain identical. WOFF2 works in current Chrome,
  Firefox, Safari and Android System WebView; no new game API is required.

The WOFF2 asset is checked in. To regenerate it, use FontTools with Brotli:

```python
from fontTools.ttLib import TTFont
font = TTFont('assets/word-rain-hand.woff')
font.flavor = 'woff2'
font.save('assets/word-rain-hand.woff2')
```

`python tools/optimize-web-assets.py` embeds that font and deduplicates exact
paths in the readable source before rebuilding. Run it after changing embedded
artwork. Historical asset generators predate `src/`; direct any new generated
markup to the readable source before running the build.

## Verification

Run `node tools/check-optimized.cjs` for the current dev scoring matrix and
unchanged target/spawning checks, including a generated mobile HTML fixture.
Run `node tools/check-test-lab.cjs` for the browser sandbox controls and storage
isolation. Historical 1.6.4 suites assert the earlier fixed score amounts; their
original versions remain in the stable tag. The current 1.6.4.1 formula and
upward rounding are tested in `android/tests/scoring-1641.cjs`.
Physical Android installation is outside this HTML development release.

Stable APK 1.6.4 uses the same signing certificate and save-data keys as 1.6.3. Development releases do not trigger the Android stable-update checker.
