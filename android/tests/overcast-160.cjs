const fs=require('fs'),path=require('path'),assert=require('assert');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
const web=[...fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
function boot(source,mode){const t=session({},false,source);t.el('difficulty').value=mode;t.el('apply-settings').onclick();t.run("start();words.splice(0,words.length,'RAIN','MOON');wordIndex=0;progress=2;shieldHealth=0;items=[];spawn=99;perfectRun=6;doubleScore=true;wildcardUnlocked=true;hud()");return t;}
function wrong(t){t.run('x=target=240;spawn=99;items=[{x:240,y:460,speed:0,letter:"Z"}];update(0)');}
for(const source of [web,scripts])for(const mode of ['normal','hard']){
 const t=boot(source,mode);
 for(let n=1;n<=3;n++){wrong(t);assert.equal(t.run('progress'),mode==='hard'||n===3?0:2);assert(!t.run('wordPerfect'));assert(!t.run('doubleScore'));assert(!t.run('wildcardUnlocked'));assert.equal(t.run('score'),Math.min(n,2)*(mode==='hard'?2:1));}
 assert(t.run('scoringPaused'));t.run('progress=2');wrong(t);assert.equal(t.run('progress'),0);t.run('items=[{x:240,y:460,speed:0,letter:"R"}];update(0)');assert.equal(t.run('progress'),1);assert.equal(t.run('wrongStreak'),0);assert(!t.run('scoringPaused'));
 for(const health of [1,2]){const shield=boot(source,mode);shield.run('shieldHealth='+health+';wrongStreak=2');wrong(shield);assert.equal(shield.run('progress'),2);assert(shield.run('wordPerfect'));assert.equal(shield.run('shieldHealth'),health-1);assert(shield.run('scoringPaused'));}
 const c=boot(source,mode);assert(!c.run('overcast'));assert(c.el('overcast-cloud').hidden);c.run('pause()');const before=c.run('JSON.stringify([score,progress,lives,shieldHealth,wordIndex])');c.el('overcast-mode').checked=true;c.el('overcast-mode').onchange();assert(c.run('overcast'));assert(!c.el('overcast-cloud').hidden);assert.equal(c.run('state'),'paused');assert.equal(c.run('JSON.stringify([score,progress,lives,shieldHealth,wordIndex])'),before);
 c.el('handwriting-mode').checked=true;c.el('handwriting-mode').onchange();const reload=session(c.store,false,source);assert(reload.run('overcast'));assert(reload.run('handwriting'));assert(!reload.el('overcast-cloud').hidden);reload.el('overcast-mode').checked=false;reload.el('overcast-mode').onchange();assert(!session(reload.store,false,source).run('overcast'));
 const legacy=session({'word-rain-settings-v1':JSON.stringify({wordSet:'space',difficulty:'hard',colorTheme:'space',handwriting:true})},false,source);assert(!legacy.run('overcast'));assert.equal(legacy.run('activeSet'),'space');assert(legacy.run('handwriting'));
}
const mobile=boot(scripts,'normal');mobile.el('mobile-stats-tab').onclick();assert.equal(mobile.run('state'),'paused');for(const id of ['pause','give-up','bgm-toggle','sfx-toggle'])assert(mobile.el(id).hidden,id+' hidden in Stats');mobile.el('mobile-game-tab').onclick();for(const id of ['pause','give-up','bgm-toggle','sfx-toggle'])assert(!mobile.el(id).hidden,id+' restored in Game');assert.equal(mobile.run('state'),'paused');
assert(html.includes('top:25%;height:50%;z-index:2;pointer-events:none'));assert(html.includes('.overcast-cloud[hidden]{display:none}'));assert(html.includes('data:image/svg+xml,'));assert(html.includes('header .header-actions button[hidden]{display:none!important}'));
console.log('PASS 1.6.0: mode-specific resets, protected third catch, scoring recovery, Overcast migration/toggle/persistence, handwriting and Stats audio visibility.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
