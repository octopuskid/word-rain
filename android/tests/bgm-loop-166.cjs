const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(process.argv[2]||'android/build/assets/index.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
let helper=fs.readFileSync('android/tests/mobile-records.cjs','utf8').split('const a=session();')[0];
helper=helper.slice(helper.indexOf('function session')).replace('setInterval(){}','setInterval(fn){c.tick=fn}');
const sandbox={scripts,fs,vm,assert,console};vm.createContext(sandbox);vm.runInContext(helper+';this.makeSession=session;',sandbox);
(async()=>{
 const t=sandbox.makeSession();
 t.c.document.body={appendChild(){}};
 class Track{constructor(){this.paused=true;this.ended=false;this.currentTime=0;this.plays=0;}play(){this.plays++;this.paused=false;this.ended=false;return Promise.resolve();}pause(){this.paused=true;}removeAttribute(){}load(){}remove(){this.removed=true;}}
 t.c.window.Audio=Track;
 t.run('state="playing";audioPrefs.bgm=true;loadCustomMusic("fixture.wav")');await new Promise(setImmediate);await new Promise(setImmediate);
 const a=t.run('customMusic');assert(a.loop);assert.equal(a.preload,'auto');assert.equal(a.plays,1);
 a.ended=true;a.paused=true;a.currentTime=1;a.onended();await new Promise(setImmediate);assert.equal(a.currentTime,0);assert.equal(a.plays,2);
 t.run('state="paused";syncAudio()');a.ended=true;a.onended();assert(a.paused);assert.equal(a.plays,2);
 t.run('state="playing";syncAudio()');await new Promise(setImmediate);assert.equal(a.plays,3);
 a.paused=true;t.c.tick();await new Promise(setImmediate);assert.equal(a.plays,4,'watchdog recovers unexpected stop');
 t.run('audioPrefs.bgm=false;syncAudio()');t.c.tick();assert(a.paused);assert.equal(a.plays,4,'watchdog obeys BGM off');
 t.run('selectMusic("original")');assert(a.removed);assert.equal(a.onended,null,'retired track cannot restart');
 let resumes=0,sources=[];
 class Context{constructor(){this.state='running';this.currentTime=1;this.destination={};}createGain(){return {gain:{value:0},connect(){}};}createBuffer(){return {duration:19.2,getChannelData(){return new Float32Array(423360)}};}createBufferSource(){const b={connect(){},disconnect(){},start(){},stop(){}};sources.push(b);return b;}resume(){resumes++;this.state='running';return Promise.resolve();}}
 t.c.window.AudioContext=Context;t.run('unlockAudio();audioPrefs.bgm=true;syncAudio()');
 assert(sources[0].loop);sources[0].onended();assert.equal(sources.length,2,'unexpected buffer end restarts BGM');
 t.run('audioContext.state="interrupted"');t.c.tick();await new Promise(setImmediate);assert.equal(resumes,1);
 t.run('state="paused";syncAudio()');assert.equal(sources[1].onended,null,'intentional stop must not restart');
 console.log('PASS BGM loop fallback, unexpected-pause recovery, pause/resume, BGM off and retired-track cleanup');
})().catch(e=>{console.error(e);process.exitCode=1;});
