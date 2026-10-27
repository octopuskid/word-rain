const fs=require('fs'),path=require('path');
let helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
helper=helper.replace('getElementById:el,addEventListener(){}','getElementById:el,addEventListener(k,v,o){events["document:"+k]={handler:v,options:o};}').replace('return {c,el,store,run:', 'return {c,el,store,events,run:');
const checks=String.raw`
const locks=[];const native={setHomeScrollLocked:value=>locks.push(value)};
const t=session({'word-rain-tutorial-v1':'done'},false,scripts,native,true);
assert.equal(locks.at(-1),true,'Home locks native scroll');
for(const event of ['touchmove','wheel']){
 assert.equal(t.events['document:'+event].options.passive,false);
 let prevented=false;t.events['document:'+event].handler({cancelable:true,preventDefault(){prevented=true;}});assert(prevented,'Home pan blocked');
}
for(const id of ['dream-classic','dream-story','dream-stats']){
 t.run('routeDream("home")');t.el(id).onclick();assert.equal(locks.at(-1),false,'menu button remains tappable and unlocks next page');
 let prevented=false;t.events['document:touchmove'].handler({cancelable:true,preventDefault(){prevented=true;}});assert.equal(prevented,false,'longer pages retain scroll');
}
t.run('routeDream("home")');assert.equal(locks.at(-1),true,'returning Home relocks');
const firstLocks=[];const first=session({},false,scripts,{setHomeScrollLocked:v=>firstLocks.push(v)},true);
assert(first.run('tutorialActive'));assert.equal(firstLocks.at(-1),false,'tutorial permits scrolling');
let prevented=false;first.events['document:touchmove'].handler({cancelable:true,preventDefault(){prevented=true;}});assert.equal(prevented,false);
first.el('tutorial-skip').onclick();assert.equal(firstLocks.at(-1),true,'closing tutorial locks Home');
const htmlOnly=fs.readFileSync(require('path').join(__dirname,'../../index.html'),'utf8');assert(!htmlOnly.includes('setHomeScrollLocked'),'native scroll guard is Android-only');
console.log('PASS dev8: native lock follows Home/tutorial/navigation, swipe prevention, tappable menu, other-page scroll and HTML isolation.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
