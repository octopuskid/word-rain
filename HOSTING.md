# Add Word Rain to your website

Word Rain is a static HTML game. You can embed the hosted game in an existing page, or host your own copy. No database, account system, Node.js server or build step is needed for the browser game.

## Choose an approach

| Approach | Best for | Updates |
| --- | --- | --- |
| Embed the hosted game | Adding the game quickly to an existing website | Follows the official GitHub Pages version |
| Host a release yourself | Keeping a specific version or making changes | Replace your files when you choose to update |
| Publish your copy on GitHub Pages | Hosting without managing a server | Publish commits from your repository |

## 1. Embed the hosted game

Paste this into the **body** of your page, where you want the game to appear. In a website builder, use its custom HTML/embed block if it supports iframes.

```html
<section aria-label="Play Word Rain">
  <iframe
    src="https://octopuskid.github.io/word-rain/"
    title="Word Rain — catch letters and spell words"
    loading="lazy"
    allow="fullscreen"
    allowfullscreen
    style="display:block;width:100%;height:900px;border:0;border-radius:16px;"
  ></iframe>
  <p>
    <a href="https://octopuskid.github.io/word-rain/"
       target="_blank" rel="noopener noreferrer">
      Open Word Rain in a new tab
    </a>
  </p>
</section>
```

The frame's width follows its container. Adjust its height for your site; keep the frame scrollable so players can reach settings and instructions. The game uses its existing phone portrait and PC landscape layouts. Click inside the game before using keyboard controls. Music starts only after a player interaction and must be enabled with the BGM switch.

This embed depends on the official host being available and may change with future releases. To keep a fixed version, use the self-hosting method below.

## 2. Host the files on your website

1. Open [Releases](https://github.com/octopuskid/word-rain/releases) and choose a version.
2. Download **word-rain.zip** (the single merged edition). These are browser packages; the APK files are for Android installation.
3. Extract the ZIP on your device. Upload the extracted contents into a new folder on your website, such as `games/word-rain/`. Do not overwrite your site's existing home page.
4. Keep the package's relative paths intact. The game HTML is self-contained; optional recordings download from the Word Rain repository only after confirmation. Keep `LICENSE`, and keep `MUSIC-LICENSES.md` for optional music credits.
5. Visit the uploaded `games/word-rain/index.html` using your site's HTTPS address.

The single edition includes the original generated music, effects and local importing. Kevin MacLeod recordings are not packaged; players can approve optional downloads from the repository. The handwriting font is embedded in the HTML.

Link directly to your uploaded game, or use the iframe example above and change its source to your own game path:

```html
<iframe
  src="./games/word-rain/index.html"
  title="Play Word Rain"
  loading="lazy"
  allow="fullscreen"
  allowfullscreen
  style="display:block;width:100%;height:900px;border:0;"
></iframe>
```

That relative path assumes the page containing the iframe is in your site's root folder. Adjust it if your page is elsewhere. Avoid pasting the game's complete HTML into an existing page: its styles and scripts are intended to run as their own document.

## 3. Host your copy on GitHub Pages

For a new static website:

1. Create a public GitHub repository.
2. Extract a browser release ZIP and upload its contents to the repository. Put `index.html` at the root, rather than inside an extra enclosing folder. Include the license notices. No MP3 folder is required.
3. Commit the files to your `main` branch.
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**. Select **main** and **/ (root)**, then save.
6. Wait for the Pages deployment to finish. Open the website address shown in Pages settings and test the game.

If you already have a GitHub Pages website, add the game in a separate subfolder and keep your current publishing setup. Use that subfolder's published URL in your iframe. A repository's normal GitHub file-view URL displays source; use the published Pages URL for players.

See [GitHub's publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) for other setups, including sites published with Actions.

## Test before sharing

- Open the published page on a phone and a computer.
- Start a game and try dragging, keyboard controls and pause/resume.
- Make sure the frame can scroll and its controls are reachable.
- Turn BGM and SFX on after interacting with the game.
- Optional music downloads need an internet connection and access to raw.githubusercontent.com. On file:// pages, browser security may prevent the download; host over HTTPS or use the APK. The original music always remains available.
- If your site builder removes the iframe, use a direct link or a supported embed block.
- If an iframe is blocked by your site's content-security policy, configure the relevant frame policy or offer a direct link. Do not remove security headers indiscriminately.

## Updates, data and credits

For self-hosted updates, replace the game and matching assets together while preserving the same site address and storage keys. Device settings and unlocks are stored by the browser; moving to a different domain, browser profile or embedding context may use separate storage. Browser privacy settings may restrict storage inside a third-party iframe. Android personal-best and word-stat records belong to the Android app and do not transfer through an iframe.

The code, original handwriting font, original generated music and synthesized effects use the repository's [MIT license](LICENSE). Retain its copyright and permission notice when redistributing them. The optional repository recordings have separate attribution requirements: retain their credits, license links and modification notices from [MUSIC-LICENSES.md](MUSIC-LICENSES.md).

A visible link back to [the project](https://github.com/octopuskid/word-rain) is appreciated. Check the included licenses before redistributing a modified package.

Reference: [MDN's iframe documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe).

## Optimized development HTML

The GitHub Pages demo currently runs HTML development build 1.6.3.2. Stable 1.6.3 remains available from its release and itch.io. Use the single `word-rain-1.6.3.2.html` file from the development prerelease for the smaller self-contained game; no extra assets or music downloads are required for basic offline play. Optional tracks still ask for consent. To rebuild this file from the readable source, see [OPTIMIZATION.md](OPTIMIZATION.md).
