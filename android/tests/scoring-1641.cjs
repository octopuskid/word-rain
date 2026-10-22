const fs=require('fs'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
const web=[...fs.readFileSync(require('path').join(__dirname,'../../index.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const rounded=n=>Math.round(n*100)/100;
const award=n=>Math.ceil(Math.round(n*1000000)/1000000);
function boot(source,mode,cloud,speed){
 const t=session({},false,source);t.el('difficulty').value=mode;t.el('apply-settings').onclick();
 t.run('start();words.splice(0,words.length,"RAIN","MOON");wordIndex=0;progress=0;score=0;perfectWords=0;perfectRun=0;wordPerfect=true;items=[];spawn=99;overcast='+cloud+';speedMultiplier='+speed+';hud()');
 return t;
}
function caught(t,kind,letter=''){t.run('items=[{x:240,y:460,speed:0,letter:'+JSON.stringify(letter)+',bomb:'+(kind==='bomb')+',shield:'+(kind==='shield')+',wild:'+(kind==='wild')+'}];x=target=240;spawn=99;update(0)');}
for(const source of [web,scripts])for(const mode of ['normal','hard'])for(const cloud of [false,true])for(const speed of (mode==='hard'?[1.4,1.8,2.6]:[1,1.35,1.8,2.2])){
 const factor=(mode==='hard'?2:1)*(cloud?2:1)*speed;
 const t=boot(source,mode,cloud,speed);caught(t,'letter','R');assert.equal(t.run('score'),award(10*factor));assert.equal(t.run('progress'),1);
 const wildcard=boot(source,mode,cloud,speed);caught(wildcard,'wild');assert.equal(wildcard.run('score'),award(10*factor));
 const wrong=boot(source,mode,cloud,speed);wrong.run('progress=2');caught(wrong,'letter','Z');assert.equal(wrong.run('score'),award(factor),'wrong points use pre-penalty speed');assert.equal(wrong.run('progress'),mode==='hard'?0:2);assert(!wrong.run('wordPerfect'));
 for(const shield of [1,2]){const s=boot(source,mode,cloud,speed);s.run('shieldHealth='+shield+';progress=2;doubleScore=true;perfectRun=6;wildcardUnlocked=true');caught(s,'letter','Z');assert.equal(s.run('score'),award(factor),'wrong letters never get perfect multiplier');assert.equal(s.run('progress'),2);assert(s.run('wordPerfect'));assert(s.run('doubleScore'));assert.equal(s.run('shieldHealth'),shield-1);}
 const word=boot(source,mode,cloud,speed);word.run('progress=3;perfectWords=1;perfectRun=5;lives=2');caught(word,'letter','N');assert.equal(word.run('score'),rounded(award(10*factor)+award(50*factor)),'completion uses pre-reward speed and pre-sixth-word bonus');assert(word.run('doubleScore'));assert.equal(word.run('lives'),3);
 const nextFactor=word.run('scoreFactor()');caught(word,'letter','M');assert.equal(word.run('score'),rounded(rounded(award(10*factor)+award(50*factor))+award(20*nextFactor)));
 const bonus=boot(source,mode,cloud,speed);bonus.run('doubleScore=true;perfectRun=6;progress=3');caught(bonus,'letter','N');assert.equal(bonus.run('score'),rounded(award(20*factor)+award(100*factor)));
 const pause=boot(source,mode,cloud,speed);pause.run('wrongStreak=2');caught(pause,'letter','Z');assert.equal(pause.run('score'),0);assert(pause.run('scoringPaused'));caught(pause,'letter','R');assert.equal(pause.run('score'),0);assert(!pause.run('scoringPaused'));caught(pause,'letter','A');assert.equal(pause.run('score'),pause.run('scorePoints(10)'));
 const overlap=boot(source,mode,cloud,speed);overlap.run('progress=1;items=[{x:100,y:100,speed:0,wild:true},{x:100,y:100,speed:0,wild:true}];resolveBlockOverlaps();hud()');assert.equal(overlap.run('score'),rounded(3*award(10*factor)+award(50*factor)));
 const hazard=boot(source,mode,cloud,speed);hazard.run('progress=2');caught(hazard,'bomb');assert.equal(hazard.run('score'),0);assert.equal(hazard.run('lives'),2);assert.equal(hazard.run('progress'),0);
}
const example=boot(web,'hard',true,1.8);caught(example,'letter','R');assert.equal(example.run('score'),72,'user example: 10 × 2 × 2 × 1.8');
const toggle=boot(web,'normal',false,1.35);toggle.run('pause()');toggle.el('overcast-mode').checked=true;toggle.el('overcast-mode').onchange();assert.equal(toggle.run('score'),0);assert.equal(toggle.run('state'),'paused');assert(toggle.el('score-multiplier').textContent.includes('Points ×1.35'));toggle.el('apply-settings').onclick();assert(toggle.el('score-multiplier').textContent.includes('Points ×2'));assert(toggle.run('overcast'));
const fractions=boot(scripts,'normal',false,1.35);fractions.run('for(let i=0;i<1000;i++)addScore(.1);hud()');assert.equal(fractions.run('score'),100,'no floating point accumulation noise');assert.equal(fractions.run('mobileRecords.highScore'),100);caught(fractions,'letter','Z');assert.equal(fractions.run('score'),102);assert.equal(fractions.run('mobileRecords.highScore'),102);
const up=boot(web,'hard',true,1.81);caught(up,'letter','R');assert.equal(up.run('score'),73,'72.4 rounds upward');const exact=boot(web,'normal',false,1.1);assert.equal(exact.run('scorePoints(100)'),110,'floating point noise does not add a point');
const stored={'word-rain-mobile-records-v1':JSON.stringify({highScore:1234.5,words:{RAIN:{met:4,perfect:2}}})};const migrated=session(stored,false,scripts);assert.equal(migrated.run('mobileRecords.highScore'),1234.5);assert.equal(migrated.run('mobileRecords.words.RAIN.perfect'),2);
console.log('PASS 1.6.4.1: mode/Overcast/speed matrix; 72-point example; correct/wild/wrong/word/2x awards; shield/HP/progress, pre-penalty and pre-reward speed, pause/recovery, automatic overlap awards, upward rounding, saved best and migration.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
