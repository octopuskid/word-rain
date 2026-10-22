const fs=require('fs'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
const web=[...fs.readFileSync(require('path').join(__dirname,'../../index.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
for(const source of [web,scripts])for(const initial of [false,true]){
 const store={'word-rain-settings-v1':JSON.stringify({wordSet:'classic',difficulty:'normal',overcast:initial})};
 const t=session(store,false,source);t.run('start();score=42;progress=2;hud();pause()');
 const before=t.run('JSON.stringify([score,progress,lives,wordIndex,scoreFactor(),overcast])');
 t.el('overcast-mode').checked=!initial;t.el('overcast-mode').onchange();
 assert.equal(t.run('pendingOvercast'),!initial);assert.equal(t.run('overcast'),initial);
 assert.equal(t.el('overcast-cloud').hidden,!initial);assert.equal(t.run('state'),'paused');
 assert.equal(t.run('JSON.stringify([score,progress,lives,wordIndex,scoreFactor(),overcast])'),before);
 // Other settings saves retain the pending selection, not the current run's value.
 t.el('handwriting-mode').checked=true;t.el('handwriting-mode').onchange();
 assert.equal(JSON.parse(t.store['word-rain-settings-v1']).overcast,!initial);
 const reload=session({...t.store},false,source);reload.run('start()');assert.equal(reload.run('overcast'),!initial);
 t.run('start()');assert.equal(t.run('state'),'playing');assert.equal(t.run('overcast'),initial);
 assert.equal(t.run('scoreFactor()'),initial?2:1);assert.equal(t.run('score'),42);assert.equal(t.run('progress'),2);
 t.run('pause()');t.el('apply-settings').onclick();assert.equal(t.run('state'),'playing');
 assert.equal(t.run('overcast'),!initial);assert.equal(t.el('overcast-cloud').hidden,initial);
 assert.equal(t.run('scoreFactor()'),initial?1:2);assert.equal(t.run('score'),0);
 t.el('overcast-mode').checked=initial;t.el('overcast-mode').onchange();t.run('state="over";start()');
 assert.equal(t.run('overcast'),initial);assert.equal(t.run('scoreFactor()'),initial?2:1);
}
console.log('PASS Overcast next run: both toggle directions, paused cloud/scoring/progress preservation, resume, apply/new run, game-over restart, preference persistence and appearance saves on web/mobile HTML.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
