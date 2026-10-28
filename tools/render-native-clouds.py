"""Rasterize the existing HTML cloud artwork for native Android (Inkscape)."""
from pathlib import Path
import subprocess
ROOT = Path(__file__).resolve().parents[1]
for name in ('clouds', 'clouds-handwriting'):
    subprocess.run(['inkscape', str(ROOT/'assets'/f'{name}.svg'),
                    '--export-type=png',
                    '--export-filename='+str(ROOT/'android/native-assets'/f'{name}.png'),
                    '--export-width=960', '--export-height=480'], check=True)
