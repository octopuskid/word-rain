"""Inject Android-only UI and records into the shared HTML game."""
from pathlib import Path
import base64, re

def mobile_html(source: str) -> str:
    root=Path(__file__).resolve().parent
    # Android always uses the portrait playfield; wide mode belongs to HTML.
    source=source.replace('function isPhoneClient(){', 'function isPhoneClient(){return true;')
    # Let Android story runs use the existing audio transport without running Classic.
    audio_marker='"playing"===state&&audioPrefs.bgm'
    assert source.count(audio_marker)==4, 'Audio transport changed; review story integration'
    source=source.replace(audio_marker,'androidAudioPlaying()&&audioPrefs.bgm')
    source=source.replace('function syncAudio(){','function androidAudioPlaying(){return state==="playing"||Boolean(window.wordRainStoryPlaying&&window.wordRainStoryPlaying());}function syncAudio(){',1)
    font='data:font/woff;base64,'+base64.b64encode((root/'assets/dream-font.woff').read_bytes()).decode()
    logo='data:image/png;base64,'+base64.b64encode((root/'assets/word-rain-2-logo.png').read_bytes()).decode()
    style=(root/'mobile.css').read_text()+(root/'dream.css').read_text().replace('__DREAM_FONT__',font)
    script=(root/'mobile.js').read_text()+'\n'+(root/'dream.js').read_text()
    theme=re.search(r'<button[^>]*id="theme-toggle"[^>]*>.*?</button>',source)
    assert theme, 'Theme switch marker changed'
    home_theme=theme.group().replace('class="theme-toggle"','class="dream-theme-toggle"')
    source=source[:theme.start()]+source[theme.end():]
    dream=(root/'dream.html').read_text().replace('__DREAM_LOGO__',logo).replace('__HOME_THEME__',home_theme)
    source=source.replace('<main>','<main id="android-classic" hidden>',1)
    source=source.replace('<header>','<button type="button" id="classic-home">← Home</button><header>',1)
    assert '</header>' in source and '</main>' in source and '</style>' in source
    source=source.replace('</style>',style+'\n</style>',1)
    source=source.replace('</header>','</header><div class="mobile-panel" id="mobile-game-panel" role="tabpanel" aria-labelledby="mobile-game-tab">',1)
    source=source.replace('<p>Your settings return after game over. Saved records are kept.</p>','<button type="button" id="replay-tutorial">Replay tutorial</button><p>Your settings return after game over. Saved records are kept.</p>',1)
    match=re.search(r'<div\b[^>]*class="meters"[^>]*>',source)
    assert match, 'Meter container changed'
    marker=match.group(0)
    source=source.replace(marker,'<div class="mobile-high-score"><span>PERSONAL BEST</span><strong id="high-score">0</strong></div>'+marker,1)
    panel='''</div><section class="mobile-panel" id="mobile-stats-panel" role="tabpanel" aria-labelledby="mobile-stats-tab" hidden>
<h2>Word stats</h2><p class="mobile-stats-intro">Your words, across all games on this device. A word is met each time it becomes the target, including the first word of a new game. Resetting progress on the same word does not add an encounter.</p>
<div class="mobile-stats-summary" id="word-stats-summary">0 different words · 0 encounters · 0 perfect completions</div>
<table class="word-stats-table"><caption>Perfect counts follow the game's shield and hazard rules.</caption><thead><tr><th scope="col">Word</th><th scope="col">Met</th><th scope="col">Perfect</th></tr></thead><tbody id="word-stats-body"></tbody></table>
<div class="mobile-reset"><button type="button" id="reset-stats">Reset word stats</button>
<div id="reset-stats-confirm" hidden><p>Reset all word encounters and perfect counts? Your personal best and current game will be kept.</p><button type="button" id="confirm-reset-stats">Reset word stats</button> <button type="button" id="cancel-reset-stats">Cancel</button></div><p id="reset-stats-status" role="status"></p></div>
<p class="mobile-storage-note">Records are saved only on this device. Clearing app data or uninstalling removes them. Updating the app keeps them.</p></section>
<p class="mobile-storage-note" id="mobile-storage-warning" role="status" hidden>Local storage is unavailable. Records will last only until the app closes.</p></main>
<nav class="mobile-tabs" id="mobile-tabs" hidden inert aria-hidden="true" role="tablist" aria-label="Game and word statistics"><button type="button" role="tab" id="mobile-game-tab" aria-selected="true" aria-controls="mobile-game-panel" tabindex="0">☂ Game</button><button type="button" role="tab" id="mobile-stats-tab" aria-selected="false" aria-controls="mobile-stats-panel" tabindex="-1">▤ Word Stats</button></nav>'''
    source=source.replace('Drag the basket with your mouse, press ← → or A / D, or hold the on-screen arrows.','Drag your finger across the play area to move the basket.',1)
    source=source.replace('</main>',panel,1)
    source=source.replace('</body>',dream+(root/'tutorial.html').read_text()+'<script>\n'+script+'\n</script></body>',1)
    return source.replace(' target="_blank"','')
