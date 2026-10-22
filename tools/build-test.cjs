const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
let html=read('index.html');
// The same origin hosts the real game: isolate every storage key used by it.
for(const key of ['theme','settings-v1','rick-unlocked-v1','audio-v1'])
  html=html.split('word-rain-'+key).join('word-rain-lab-'+key);
html=html.replace('<title>Word Rain — Catch a little wordplay</title>','<title>Word Rain test lab — Not a scored game</title>');
const css='.arena::after{content:"TEST MODE";position:absolute;top:12px;left:12px;padding:6px 9px;border:1px solid var(--border);border-radius:8px;background:var(--page);color:var(--text);pointer-events:none;z-index:3;font:700 11px/1.2 system-ui;letter-spacing:.1em;user-select:none}.arena .overlay{z-index:2}.sandbox{border:2px dashed var(--accent);padding:16px;border-radius:16px;margin-bottom:20px;font:14px/1.45 system-ui}.sandbox h2{font:700 24px system-ui;margin-bottom:8px}.sandbox p{font-size:13px}.sandbox summary{cursor:pointer;font-weight:700}.sandbox-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:14px 0}.sandbox label{display:grid;gap:5px}.sandbox input:not([type=checkbox]),.sandbox select,.sandbox textarea{font:inherit;width:100%;padding:9px;background:var(--button);color:var(--text);border:1px solid var(--border);border-radius:6px}.sandbox textarea{margin:8px 0}.sandbox-buttons{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.sandbox button{font:inherit;padding:10px 12px}.sandbox a{color:var(--accent)}';
html=html.replace('</style>',css+'</style>').replace('<main>','<main>'+read('tools/test-panel.html'));
html=html.replace('</body>','<script>'+read('tools/test-panel.js')+'</script></body>');
fs.writeFileSync(path.join(root,'test.html'),html);
console.log('Built separate test.html; no changes to the regular game or APK input.');
