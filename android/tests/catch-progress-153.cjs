const fs=require('fs'),path=require('path'),assert=require('assert');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const tests=String.raw`
const web=[...fs.readFileSync(require('path').join(__dirname,'../../index.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
function boot(mode,source,health,progress){const t=session({},false,source);t.el('difficulty').value=mode;t.el('apply-settings').onclick();t.run("start();words.splice(0,words.length,'RAIN','MOON');wordIndex=0;items=[];spawn=99;progress="+progress+';shieldHealth='+health+';lives=3;perfectRun=6;doubleScore=true;wildcardUnlocked=true;setSpeed(baseSpeed()+.4);hud()');return t;}
function catchBlock(t,bomb){t.run('spawn=99;x=target=240;items=[{x:240,y:460,speed:0,bomb:'+bomb+",letter:'Z'}];update(0)");}
for(const source of [web,scripts])for(const mode of ['normal','hard'])for(const health of [0,1,2])for(const progress of [1,2,3]){
 const hazard=boot(mode,source,health,progress),before=hazard.run('speedMultiplier');catchBlock(hazard,true);
 assert.equal(hazard.run('progress'),health?progress:0);assert.equal(hazard.run('lives'),health===2?3:2);assert.equal(hazard.run('shieldHealth'),0);assert.equal(hazard.run('wordPerfect'),health===1);assert.equal(hazard.run('doubleScore'),health===1);assert.equal(hazard.run('score'),0);assert(Math.abs(hazard.run('speedMultiplier')-(before-.2))<1e-8);assert.equal(hazard.el('arena-word').innerHTML,hazard.el('word').innerHTML);
 const wrong=boot(mode,source,health,progress),speed=wrong.run('speedMultiplier');catchBlock(wrong,false);
 assert.equal(wrong.run('progress'),health===0&&mode==='hard'?0:progress);assert.equal(wrong.run('lives'),3);assert.equal(wrong.run('shieldHealth'),Math.max(0,health-1));assert.equal(wrong.run('wordPerfect'),health>0);assert.equal(wrong.run('doubleScore'),health>0);assert.equal(wrong.run('wildcardUnlocked'),health>0);assert.equal(wrong.run('score'),mode==='hard'?2:1);assert(Math.abs(wrong.run('speedMultiplier')-(speed-.05))<1e-8);assert.equal(wrong.el('arena-word').innerHTML,wrong.el('word').innerHTML);
 if(health===0){catchBlock(wrong,false);catchBlock(wrong,false);assert.equal(wrong.run('progress'),0);assert(wrong.run('scoringPaused'));assert.equal(wrong.run('score'),mode==='hard'?4:2);wrong.run('items=[{x:240,y:460,speed:0,letter:words[wordIndex][progress]}];update(0)');assert(!wrong.run('scoringPaused'));assert.equal(wrong.run('score'),(mode==='hard'?4:2));}
}
const fatal=boot('normal',scripts,0,3);fatal.run('lives=1');catchBlock(fatal,true);assert.equal(fatal.run('state'),'over');assert.equal(fatal.run('progress'),0);assert.equal(fatal.run('lives'),0);
console.log('PASS 1.5.3: hazard/wrong-letter progress, HP, perfection, shields, bonuses, penalties, third-wrong pause/recovery and fatal hazard in web/mobile, Normal/Hard.');
`;
new Function('require','__dirname','process',helper+'\n'+tests)(require,__dirname,process);
