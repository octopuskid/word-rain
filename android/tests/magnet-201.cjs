const fs=require('fs'),path=require('path'),assert=require('assert');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
const path=require('path');const source=fs.readFileSync(path.join(__dirname,'../../src/index.html'),'utf8');
const scripts201=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
function boot(){const t=session({},false,scripts201);t.run('start();words.splice(0,words.length,"RAIN","CLOUD");wordIndex=progress=0;items=[];spawn=99');return t;}
function pulse(t,props){t.run('items='+JSON.stringify(props.map(p=>Object.assign({x:240,y:400,speed:100},p)))+';collectMagnet({x:240,y:470})');}
for(const pair of ['RR','RA','AR','AA']){const t=boot();pulse(t,[...pair].map(letter=>({letter})));assert.equal(t.run('progress'),2,pair);assert.equal(t.run('score'),20);t.run('resolveBlockOverlaps()');assert.equal(t.run('items.length'),2);t.run('items.forEach(a=>a.y=470);update(0)');assert.equal(t.run('score'),20);assert.equal(t.run('progress'),2);}
let t=boot();t.run('difficulty="hard";overcast=true;speedMultiplier=2;shieldHealth=2;wrongStreak=3;scoringPaused=true;perfectRun=6;doubleScore=wildcardUnlocked=true');pulse(t,[{letter:'Z'}]);assert.equal(t.run('JSON.stringify([score,progress,shieldHealth,wrongStreak,scoringPaused,perfectRun,doubleScore,wildcardUnlocked,speedMultiplier])'),'[1,0,2,3,true,6,true,true,2]');
t=boot();pulse(t,Array.from({length:6},()=>({bomb:true})));assert.equal(t.run('lives'),2);t.run('items.forEach(a=>a.y=470);update(0)');assert.equal(t.run('lives'),2);
t=boot();t.run('wordPerfect=false;progress=1');pulse(t,[{bomb:true},{wild:true},{wild:true}]);assert.equal(t.run('JSON.stringify([wordIndex,progress,perfectRun,wildcardUnlocked,lives])'),'[1,0,1,true,2]');
t=boot();t.run('progress=3');pulse(t,Array.from({length:4},()=>({letter:'N'})));assert.equal(t.run('wordIndex'),1);assert.equal(t.run('progress'),0);
t=boot();pulse(t,[{letter:'R',y:485.01}]);assert.equal(t.run('progress'),0);assert(!t.run('items[0].magnetPull'));
assert(!source.includes('id="magnet-mode"'));assert(source.includes('!bomb&&!magnet&&!shield&&wildcardUnlocked'));assert(source.includes('top:25%;height:50%;z-index:2;pointer-events:none'));
console.log('PASS 2.0.1 HTML magnet batch rules, wrong +1 isolation, hazards/wildcards, no double catch/spill and floor.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,{argv:['node','test',path.join(__dirname,'../../index.html')]});
