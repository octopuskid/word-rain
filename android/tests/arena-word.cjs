const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=`
function mirror(t){assert.equal(t.el('arena-word').innerHTML,t.el('word').innerHTML,'in-field word matches target');}
function catchBlock(t,letter){t.run('spawn=99;x=target=240;items=[{x:240,y:460,speed:0,letter:'+JSON.stringify(letter)+'}];update(0)');mirror(t);}
for(const mode of ['normal','hard']){
 const t=session();t.el('difficulty').value=mode;t.el('apply-settings').onclick();mirror(t);
 t.run("words.splice(0,words.length,'RAIN','MOON');wordIndex=0;progress=0;hud()");mirror(t);
 catchBlock(t,'R');assert(t.el('arena-word').innerHTML.includes('color:var(--accent)'));
 catchBlock(t,'!');assert.equal(t.run('progress'),mode==='hard'?0:1);
 t.run('shieldHealth=2;doubleScore=true;perfectRun=6;hud()');mirror(t);assert(t.el('arena-word').classList.contains('bonus'));
 catchBlock(t,'!');assert(t.el('arena-word').classList.contains('bonus'),'protected catch retains yellow background word');
 t.run('shieldHealth=0');catchBlock(t,'!');assert(!t.el('arena-word').classList.contains('bonus'));
 t.run('scoringPaused=false;wrongStreak=0;progress=3;hud()');catchBlock(t,'N');assert.equal(t.run('words[wordIndex]'),'MOON');
 t.run('pause()');mirror(t);t.run('start()');mirror(t);
 t.run('beginRickChallenge();hud()');mirror(t);assert(t.el('arena-word').classList.contains('sequence'));assert(!t.el('arena-word').classList.contains('bonus'));
 t.run('rickChallenge.next=3;rickChallenge.caught=3;hud()');mirror(t);
 t.run("state='over';start()");mirror(t);assert(!t.el('arena-word').classList.contains('sequence'));
 t.run('handwriting=true;applyTheme("light");hud();draw()');mirror(t);
}
assert(html.includes('id="arena-word" aria-hidden="true"'),'decorative copy avoids duplicate announcements');
assert(html.includes('pointer-events:none'),'background cannot intercept dragging');
console.log('PASS: background target sync after catches, resets, completion, pause/resume, bonus, protected mistakes, Rick progress, restart and handwriting.');
`;
vm.runInNewContext(helper+checks,{require,process:{argv:['node',__filename,process.argv[2]||path.join(__dirname,'../build/assets/index.html')]},__dirname,console});
