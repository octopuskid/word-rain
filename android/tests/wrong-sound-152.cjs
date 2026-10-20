const fs=require('fs'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const tests=String.raw`
const web=[...fs.readFileSync(require('path').join(__dirname,'../../index.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
for(const source of [web,scripts])for(const mode of ['normal','hard'])for(const health of [0,1,2])for(const streak of [0,2,3]){
 const t=session({},false,source);t.el('difficulty').value=mode;t.el('apply-settings').onclick();
 t.run("var tones=[];function node(){return {gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(v){this.attack=v},exponentialRampToValueAtTime(){}},frequency:{value:0},connect(){},disconnect(){},start(at){this.started=at},stop(at){this.stopped=at}}}window.AudioContext=class{constructor(){this.state='running';this.currentTime=0;this.destination={}}createGain(){return node()}createOscillator(){const n=node();tones.push(n);return n}};start();audioPrefs.sfx=true;audioPrefs.bgm=false;shieldHealth="+health+';wrongStreak='+streak+';scoringPaused='+(streak===3)+';progress=1;wordPerfect=true;');
 const speed=t.run('speedMultiplier');
 function wrong(){t.run('spawn=99;x=target=240;items=[{x:240,y:460,speed:0,bomb:false,wild:false,shield:false,letter:"!"}];update(0)')}
 wrong();assert.equal(t.run('tones[0].frequency.value'),620);assert.equal(t.run('tones[1].frequency.value'),390);assert(t.run('tones[0].type==="triangle"&&tones[1].type==="triangle"'));assert(t.run('tones[1].started>tones[0].started'));assert(t.run('tones[1].stopped>.25'));assert.equal(t.run('sfxGain.gain.value'),.22,'SFX independent of disabled BGM');
 assert.equal(t.run('shieldHealth'),Math.max(0,health-1));assert.equal(t.run('progress'),!health&&(mode==='hard'||streak>=2)?0:1);assert.equal(t.run('wordPerfect'),!!health);assert.equal(t.run('scoringPaused'),streak>=2);
 t.el('sfx-toggle').onclick();const count=t.run('tones.length');wrong();assert.equal(t.run('tones.length'),count,'muted wrong catches schedule no tones');
}
const signal=session();signal.run("var attack;audioPrefs.sfx=true;audioContext={state:'running',currentTime:0,createOscillator(){return {frequency:{},connect(){},start(){},stop(){}}},createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(v){attack=v},exponentialRampToValueAtTime(){}},connect(){}}}};sfxGain={};sound('wrong')");assert.equal(signal.run('attack'),.70,'wrong cue has stronger attack');signal.run("sound('correct')");assert.equal(signal.run('attack'),.45,'other cue levels unchanged');
console.log('PASS 1.5.2: actual wrong-catch synthesis, shield/no-shield, Normal/Hard, active/third/paused scoring, mute and stronger attack; progress/perfection preserved.');
`;
new Function('require','__dirname','process',helper+'\n'+tests)(require,__dirname,process);
