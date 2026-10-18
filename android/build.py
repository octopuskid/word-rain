#!/usr/bin/env python3
"""Build a signed offline APK with Android SDK Build Tools 35 and Java 17+."""
import argparse, hashlib, os, shutil, subprocess, zipfile
import xml.etree.ElementTree as ET
from mobile import mobile_html
from variants import lite_html
from pathlib import Path

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--build-tools', type=Path, required=True)
parser.add_argument('--android-jar', type=Path, required=True)
parser.add_argument('--ecj', type=Path, required=True, help='Eclipse ECJ 3.40.0 compiler JAR')
parser.add_argument('--keystore', type=Path, required=True)
parser.add_argument('--password-file', type=Path, required=True)
parser.add_argument('--lite', action='store_true', help='Omit bundled recordings; keep original music and local importing')
args=parser.parse_args()
root=Path(__file__).resolve().parent
version=ET.parse(root/'AndroidManifest.xml').getroot().attrib['{http://schemas.android.com/apk/res/android}versionName']
out=root/('build-lite' if args.lite else 'build')
apk=out/('word-rain-'+version+('-lite' if args.lite else '')+'.apk')
if out.exists():shutil.rmtree(out)
for name in ['assets','classes','dex']: (out/name).mkdir(parents=True,exist_ok=True)
# Shared game plus Android-only records UI; external links use the native browser.
source=(root.parent/'index.html').read_text()
html=mobile_html(lite_html(source) if args.lite else source)
(out/'assets'/'index.html').write_text(html)
if args.lite:
    license_text=(root.parent/'LICENSE').read_text().split('\nThird-party music exception:')[0]
    (out/'assets'/'LICENSE').write_text(license_text)
else:
    shutil.copyfile(root.parent/'LICENSE',out/'assets'/'LICENSE')
    shutil.copyfile(root.parent/'MUSIC-LICENSES.md',out/'assets'/'MUSIC-LICENSES.md')
    shutil.copytree(root.parent/'assets'/'music',out/'assets'/'music')

def run(*cmd):subprocess.run([str(c) for c in cmd],check=True)
tools=args.build_tools.resolve(); jar=args.android_jar.resolve()
run(tools/'aapt2','compile','--dir',root/'res','-o',out/'resources.zip')
run(tools/'aapt2','link','-o',out/'unsigned.apk','--manifest',root/'AndroidManifest.xml','-I',jar,'-A',out/'assets','--min-sdk-version','26','--target-sdk-version','35',out/'resources.zip')
sources=sorted((root/'src').rglob('*.java'))
run('java','-jar',args.ecj.resolve(),'-source','8','-target','8','-bootclasspath',jar,'-d',out/'classes',*sources)
run('java','-cp',tools/'lib'/'d8.jar','com.android.tools.r8.D8','--release','--min-api','26','--lib',jar,'--output',out/'dex',*sorted((out/'classes').rglob('*.class')))
with zipfile.ZipFile(out/'unsigned.apk','a',zipfile.ZIP_DEFLATED) as package_zip:
    for dex in sorted((out/'dex').glob('*.dex')):package_zip.write(dex,dex.name)
run(tools/'zipalign','-f','-p','4',out/'unsigned.apk',out/'aligned.apk')
run('java','-jar',tools/'lib'/'apksigner.jar','sign','--ks',args.keystore.resolve(),'--ks-key-alias','word-rain','--ks-pass','file:'+str(args.password_file.resolve()),'--out',apk,out/'aligned.apk')
run('java','-jar',tools/'lib'/'apksigner.jar','verify','--verbose','--print-certs',apk)
run(tools/'zipalign','-c','-p','4',apk)
(out/('SHA256SUMS-lite.txt' if args.lite else 'SHA256SUMS.txt')).write_text(hashlib.sha256(apk.read_bytes()).hexdigest()+'  '+apk.name+'\n')
print('Built:',apk)
