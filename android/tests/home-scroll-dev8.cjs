const fs=require('fs'),path=require('path');
let helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
helper=helper.replace('getElementById:el,addEventListener(){}','getElementById:el,addEventListener(k,v,o){events["document:"+k]={handler:v,options:o};}').replace('return {c,el,store,run:', 'return {c,el,store,events,run:');
const checks=String.raw`
const locks=[];const native={setHomeScrollLocked:value=>locks.push(value)};
const t=session({'word-rain-tutorial-v1':'done'},false,scripts,native,true);
assert.equal(locks.at(-1),true,'Home locks native scroll');
assert.equal(t.events['document:touchmove'],undefined,'no global touch cancellation to suppress taps');
assert.equal(t.events['document:wheel'],undefined,'no document wheel interception');
for(const id of ['dream-classic','dream-story','dream-stats']){
 t.run('routeDream("home")');t.el(id).onclick();assert.equal(locks.at(-1),false,'menu button remains tappable and unlocks next page');

}
t.run('routeDream("home")');assert.equal(locks.at(-1),true,'returning Home relocks');
const firstLocks=[];const first=session({},false,scripts,{setHomeScrollLocked:v=>firstLocks.push(v)},true);
assert(first.run('tutorialActive'));assert.equal(firstLocks.at(-1),false,'tutorial permits scrolling');

first.el('tutorial-skip').onclick();assert.equal(firstLocks.at(-1),true,'closing tutorial locks Home');
const htmlOnly=fs.readFileSync(require('path').join(__dirname,'../../index.html'),'utf8');assert(!htmlOnly.includes('setHomeScrollLocked'),'native scroll guard is Android-only');
assert(html.includes('#android-classic header h1,:root[data-dream-screen] .dream-shell .dream-home h1{font-family:var(--wr-title-font);font-weight:700;letter-spacing:-1.3px}'),'Home and Classic share wordmark typography');
assert(html.includes('--wr-title-font:system-ui,sans-serif'),'wordmark uses the Classic system font');
console.log('PASS dev9: native lock follows Home/tutorial/navigation, no touch cancellation, menu routes and Classic wordmark font, other-page scroll and HTML isolation.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
