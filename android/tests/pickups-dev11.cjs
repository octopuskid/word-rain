const fs=require('fs'),path=require('path'),assert=require('assert');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
function boot(magnet,hard=false,store={}){const t=session(store,false,scripts,null,true);t.el('difficulty').value=hard?'hard':'normal';t.el('magnet-mode').checked=magnet;t.el('magnet-mode').onchange();t.run('start()');return t;}
for(const hard of [false,true])for(const magnet of [false,true]){
 const t=boot(magnet,hard);assert.equal(t.el('shield-panel').hidden,magnet);assert.equal(t.el('meters').classList.contains('magnet-mode'),magnet);assert.equal(t.el('pickup-mode-label').textContent,magnet?'Magnet mode · 1%':'Shield mode · 1%');
 const counts=t.run('(function(){let m=0,s=0,b=0;const old=Math.random;try{for(let i=0;i<1000;i++){let at=0;Math.random=()=>{const n=at++;return n===0?.5:n===1?0:n===2?(i%100===0?.009:.5):.5};items=[];spawnDrop();if(items[0].magnet)m++;if(items[0].shield)s++;if(items[0].bomb)b++;}}finally{Math.random=old;}return [m,s,b].join();})()');assert.equal(counts,magnet?'10,0,0':'0,10,0','exclusive 1% of emitted blocks');
 t.run('doubleScore=true;wildcardUnlocked=true;hud()');assert(t.el('score').classList.contains('double-score'));assert(t.el('lives').classList.contains('wildcard'));assert.equal(t.el('arena-word').innerHTML,t.el('word').innerHTML,'background word shares progress markup');
 t.run('doubleScore=false;wildcardUnlocked=false;hud()');assert(!t.el('score').classList.contains('double-score'));
 t.run('items=[{x:400,y:486,speed:100,magnetPull:true}];moveFallingBlocks(.01)');assert(t.run('items[0].magnetMissed'));assert(!t.run('items[0].magnetPull'));assert.equal(t.run('items[0].x'),400);
 t.run('items[0].y=480;collectMagnet({x:350,y:480})');assert(!t.run('items[0].magnetPull'),'cannot reselect missed block');t.run('items.push({x:400,y:480,speed:100,letter:"Q"});resolveBlockOverlaps();collectMagnet({x:350,y:480})');assert.equal(t.run('items.length'),1);assert(t.run('items[0].magnetMissed'));assert(!t.run('items[0].magnetPull'),'merged missed drop cannot be recovered');
 t.run('items=[{x:400,y:485,speed:100},{x:400,y:485.01,speed:100}];collectMagnet({x:350,y:480})');assert.equal(t.run('items.map(a=>Boolean(a.magnetPull)).join()'),'true,false','bottom edge boundary');
 const next=session(t.store,false,scripts,null,true);assert.equal(next.run('magnetEnabled'),magnet,'mode preference preserved');assert.equal(next.el('shield-panel').hidden,magnet);
}
console.log('PASS dev11 HTML: exact exclusive pickup rates, both difficulties, saved switch, shield bar/label, score/hearts flags, target markup sync and basket-bottom exclusion.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,{argv:['node','test',path.join(__dirname,'../../index.html')]});
