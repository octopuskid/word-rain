const fs=require('fs'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
const path=require("path");
const web=[...fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const block=(kind,x=240,y=200)=>({x,y,speed:100,letter:kind==='letter'?'Z':'',magnet:kind==='magnet',shield:kind==='shield',bomb:kind==='bomb',wild:kind==='wild'});
function boot(source,mode='normal'){const t=session({},false,source);t.el('difficulty').value=mode;t.el('apply-settings').onclick();t.run("words.splice(0,words.length,'RAIN','MOON');wordIndex=0;progress=0;x=target=240;items=[];spawn=Infinity;hud()");return t;}
for(const source of [web,scripts])for(const mode of ['normal','hard']){
 const off=boot(source,mode);assert.equal(off.run('magnetEnabled'),false,'opt-in by default');
 off.el('magnet-mode').checked=true;off.el('magnet-mode').onchange();assert.equal(off.run('magnetEnabled'),true,'switch immediately enables generation');
 off.run('pause();start()');assert.equal(off.run('magnetEnabled'),true,'resume keeps generation enabled');
 off.run("state='ready';start()");assert.equal(off.run('magnetEnabled'),true);
 assert.equal(JSON.parse(off.store['word-rain-settings-v1']).magnet,true);
 off.el('magnet-mode').checked=false;off.el('magnet-mode').onchange();assert.equal(off.run('magnetEnabled'),false,'switch disables generation immediately');
 off.el('magnet-mode').checked=true;off.el('apply-settings').onclick();assert.equal(off.run('magnetEnabled'),true,'apply reads checkbox without change event');
 const resumed=boot(source,mode);resumed.run('pause()');resumed.el('magnet-mode').checked=true;resumed.el('magnet-mode').onchange();resumed.run('start()');
 assert.equal(resumed.run('magnetEnabled'),true,'paused toggle works on resume');
 resumed.run("(()=>{const old=Math.random;const rolls=[.9,0,.005,.5,.5];try{Math.random=()=>rolls.shift()??.5;spawnDrop();}finally{Math.random=old;}})()");assert(resumed.run('items[0].magnet'),'resumed run emits magnet through actual generator');
 const reload=session({...off.store},false,source);assert.equal(reload.run('pendingMagnet'),true);
 reload.el('handwriting-mode').checked=true;reload.el('handwriting-mode').onchange();assert.equal(JSON.parse(reload.store['word-rain-settings-v1']).magnet,true,'appearance preserves magnet preference');
 for(const enabled of [false,true]){
  const odds=boot(source,mode);odds.run('magnetEnabled='+enabled);
  const count=odds.run("(()=>{const old=Math.random;let count=0;try{for(let i=0;i<1000;i++){const rolls="+(enabled?"[.9,0,(i+.5)/1000,.5,.5,.5,.5]":"[.9,0,.005,.5,.5,.5]")+";Math.random=()=>rolls.shift()??.5;items=[];spawnDrop();count+=Number(Boolean(items[0].magnet));}}finally{Math.random=old;}return count;})()");
  assert.equal(count,enabled?10:0,'exact 1% among emitted blocks, no generation when off');
 }
 for(const other of ['letter','bomb','wild','shield','magnet'])for(const reverse of [false,true]){
  const t=boot(source,mode),pair=[block('magnet'),block(other,276,200)];if(reverse)pair.reverse();
  t.run('items='+JSON.stringify(pair)+';resolveBlockOverlaps()');
  assert.equal(t.run('items.length'),['shield','magnet'].includes(other)?0:1,'touch '+other);
  if(t.run('items.length'))assert.equal(t.run('blockKind(items[0])'),other);
  assert.equal(t.run('score'),0);assert.equal(t.run('lives'),3);assert.equal(t.run('progress'),0);assert(t.run('wordPerfect'));
 }
 const outside=boot(source,mode);outside.run('items='+JSON.stringify([block('magnet'),block('shield',276.01,200)])+';resolveBlockOverlaps()');assert.equal(outside.run('items.length'),2,'no contact outside tile bounds');
 const pull=boot(source,mode);const radius=pull.run('MAGNET_RADIUS');assert.equal(radius,126);
 pull.run('items='+JSON.stringify([block('letter',240,470-radius),block('bomb',240+radius,470),block('shield',240-radius-.01,470),block('wild',240+radius/Math.sqrt(2)*.99,470-radius/Math.sqrt(2)*.99)])+';collectMagnet({x:240,y:470})');
 assert.equal(pull.run('items.filter(a=>a.magnetPull).length'),3,'circle radius includes boundary, all block types, excludes outside');
 assert.equal(pull.run('score'),0);assert.equal(pull.run('progress'),0);assert.equal(pull.run('shieldHealth'),0);assert(pull.run('wordPerfect'));
 pull.run('items.push('+JSON.stringify(block('letter',240,400))+');moveFallingBlocks(.1)');assert(!pull.run('items[4].magnetPull'),'later arrivals unaffected');
 assert(pull.run('items[0].y')>470-radius,'pulled letter moves down');assert(pull.run('items[1].x')<240+radius,'pulled hazard moves sideways toward basket');
 // Selection is clipped at the basket, not at the magnet pickup's center.
 for(const kind of ['letter','bomb','shield','wild','magnet']){
  const clipped=boot(source,mode);
  clipped.run('items='+JSON.stringify([block(kind,330,484.99),block(kind,330,485),block(kind,330,485.01),block(kind,330,500)])+';collectMagnet({x:240,y:480})');
  assert.equal(clipped.run('items.map(a=>Boolean(a.magnetPull)).join()'),'true,true,false,false','basket bottom boundary for '+kind);
  clipped.run('moveFallingBlocks(.1)');
  assert.equal(clipped.run('items[2].x'),330,'excluded block never homes sideways');
  assert.equal(clipped.run('items[2].y'),495.01,'excluded block keeps falling');
 }
 const hazard=boot(source,mode);hazard.run('items='+JSON.stringify([block('magnet',240,470),block('bomb',330,470)])+';update(0)');
 assert(hazard.run('items[0].magnetPull'),'actual pickup triggers pull');assert.equal(hazard.run('lives'),3);
 hazard.run('update(.2)');assert.equal(hazard.run('lives'),2,'attracted hazard uses normal heart-loss rules');
 const letter=boot(source,mode);letter.run('items='+JSON.stringify([{...block('letter',330,400),letter:'R'}])+';collectMagnet({x:240,y:470});update(.3)');
 assert.equal(letter.run('progress'),1,'pulled letter is caught normally');assert.equal(letter.run('score'),mode==='hard'?28:10);
 const paused=boot(source,mode);paused.run('collectMagnet({x:240,y:470});pause();start()');assert.equal(paused.run('magnetPulse'),.5,'resume preserves pulse');
 paused.run("state='over';start()");assert.equal(paused.run('magnetPulse'),0,'new run clears pulse and targets');
 const secret=boot(source,mode);secret.run("rickInput='RIC';trackRickCatch({magnet:true})");assert.equal(secret.run('rickInput'),'','magnet is not an ordinary secret-trigger letter');
 // Both canvas renderers execute without external assets or image-load races.
 secret.run('items='+JSON.stringify([block('magnet')])+';draw();handwriting=true;draw()');
}
console.log('PASS magnet: opt-in/live-switch/resume/persistence, exact 1% odds in Normal/Hard, contact matrix both orders and edges, 3.5-width circle clipped at basket bottom, one-time selection, animated pull, normal catch/hazard scoring, restart/Rick rules and both renderers on web/mobile fixtures.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
