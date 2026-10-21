# HTML build and size optimization

Development build **1.6.3.1** packages the same gameplay as stable 1.6.3.
The downloadable HTML falls from 99,248 to 81,887 bytes: **17.5% smaller**.
No network loader, packed-code evaluator or gameplay feature removal is used.

## Build

Edit `src/index.html`, the readable source. Run `npm ci` then `npm run build`.
This regenerates `index.html` and `word-rain-1.6.3.1.html` byte-for-byte.
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

The gameplay scripts in the readable source are identical to stable 1.6.3.
Run `node tools/check-optimized.cjs` to confirm this and test compiled behavior.
It generates an HTML-only mobile fixture, checks the old saved-data keys and
runs the existing gameplay/save/audio/overlap/cloud/Rick regression suites
against the optimized web and mobile markup. It does not compile an APK.
Runtime browser checks cover desktop controls, phone layout, paper font and
Overcast. Physical Android installation testing is outside this HTML release.

Stable APK 1.6.3, its signing certificate and existing installed app data are
unchanged. Development releases do not trigger the Android stable-update checker.
