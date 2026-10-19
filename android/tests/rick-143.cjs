const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
vm.runInNewContext(helper+`
function catchBlock(s,item){s.run('spawn=99;items=[Object.assign({x:240,y:460,speed:0,bomb:false,wild:false,shield:false,letter:""},'+JSON.stringify(item)+')];x=target=240;update(0)');}
for(const level of ['normal','hard'])for(const set of ['classic','nature','space','tricky']){
 const t=session();assert(t.run("Object.values(wordSets).every(set=>!set.words.includes('RICK'))"));
 t.el('difficulty').value=level;t.el('word-set').value=set;t.el('apply-settings').onclick();t.run("words.splice(0,words.length,'PUNNY');wordIndex=0;progress=0");
 for(const letter of 'RIC'){catchBlock(t,{letter});assert(!t.run('rickChallenge'));}
 t.run('pause();start()');catchBlock(t,{letter:'K'});assert(t.run('Boolean(rickChallenge)'));assert.equal(t.run('rickInput'),'');assert.equal(t.run('progress'),0);assert.equal(t.run('score'),level==='hard'?4:2,'normal wrong catch scoring only');
}
for(const interrupt of [{letter:'A'},{bomb:true},{shield:true},{wild:true}]){
 const t=session();t.run("start();words.splice(0,words.length,'PUNNY');wordIndex=0;progress=0");for(const letter of 'RI')catchBlock(t,{letter});catchBlock(t,interrupt);for(const letter of 'CK')catchBlock(t,{letter});assert(!t.run('rickChallenge'),'interrupted input must not trigger');
}
const misses=session();misses.run("start();words.splice(0,words.length,'PUNNY');wordIndex=0;progress=0");for(const letter of 'RI')catchBlock(misses,{letter});misses.run("items=[{letter:'Z',x:10,y:600,speed:0}];update(0)");for(const letter of 'CK')catchBlock(misses,{letter});assert(misses.run('Boolean(rickChallenge)'),'uncaught drops do not interrupt');
const reset=session();reset.run('start()');for(const letter of 'RI')catchBlock(reset,{letter});reset.run("state='over';start()");assert.equal(reset.run('rickInput'),'');
const legacy=session({'word-rain-mobile-records-v1':JSON.stringify({highScore:123.5,words:{RICK:{met:7,perfect:3},PUNNY:{met:5,perfect:2}}}),'word-rain-rick-unlocked-v1':'true'});assert.equal(legacy.run('mobileRecords.words.RICK.met'),7);assert.equal(legacy.run('mobileRecords.words.RICK.perfect'),3);assert.equal(legacy.run('mobileRecords.highScore'),123.5);assert(legacy.run('rickUnlocked'));legacy.run('start();hud()');const reload=session(legacy.store);assert.equal(reload.run('mobileRecords.words.RICK.met'),7);
console.log('PASS: manual RICK trigger in every set/difficulty, interruption/reset/pause/miss rules, no completion bonus, and legacy RICK stats/high score/unlock migration.');
`,{require,process:{argv:['node',__filename,process.argv[2]||path.join(__dirname,'../build/assets/index.html')]},__dirname,console});
