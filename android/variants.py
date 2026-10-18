"""Build the self-contained lightweight edition from the shared game source."""
import re

def lite_html(source: str) -> str:
    """Keep generated music/importing while omitting bundled-track UI and URLs."""
    source,count=re.subn(r'const musicTracks=\{[^\n]+\};',
        "const musicTracks={original:{title:'Pocket Forecast',author:'Word Rain / octopuskid & ChatGPT'}};",source,count=1)
    assert count==1,'Music catalog marker changed'
    for name in ('carefree','monkeys'):
        source,count=re.subn(r'<option value="'+name+r'">.*?</option>','',source,count=1)
        assert count==1,'Music option marker changed'
    source,count=re.subn(r'<details class="music-credits">.*?</details>','',source,count=1,flags=re.S)
    assert count==1,'Music credits marker changed'
    source=source.replace('// Offline audio: original synthesis plus the separately credited bundled CC BY recordings.',
        '// Lightweight edition: generated original music and device-local importing only.')
    source=source.replace('<section class="audio-settings" aria-label="Music settings">',
        '<section class="audio-settings" aria-label="Music settings"><p>Lightweight edition · Original music and local importing · No bundled recordings.</p>',1)
    source=source.replace('v1.3.5 · NO UMBRELLA REQUIRED','v1.3.5 LITE · NO UMBRELLA REQUIRED',1)
    return source
