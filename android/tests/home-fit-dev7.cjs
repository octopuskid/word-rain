const fs=require('fs'),path=require('path');
const helper=fs.readFileSync(path.join(__dirname,'mobile-records.cjs'),'utf8').split('const a=session();')[0];
const checks=String.raw`
const t=session({'word-rain-tutorial-v1':'done'},false,scripts,null,true);
const home=t.el('dream-home'),shell=t.el('dream-shell');let scale=1;
home.style.setProperty=(key,value)=>{assert.equal(key,'--home-fit');scale=Number(value);};
// Measured content can exceed the viewport on small displays or large font settings.
for(const [viewport,content] of [[480,780],[568,760],[640,720],[740,820],[800,740],[915,850],[600,1200]]){
 shell.clientHeight=viewport;home.scrollHeight=content;t.run('fitDreamHome()');
 assert(scale>0&&scale<=1);assert(content*scale<=viewport-16+1e-6,'every Home control fits with breathing room');
}
shell.clientHeight=900;home.scrollHeight=700;t.run('fitDreamHome()');assert.equal(scale,1,'large screens do not enlarge or blur the UI');
shell.clientHeight=600;home.scrollHeight=900;t.run('routeDream("classic");fitDreamHome()');assert.equal(scale,1,'fit does not change other routes');
t.run('routeDream("home")');assert.equal(scale,(600-16)/900,'returning from a long route refits Home');
home.scrollHeight=1000;t.run('fitDreamHome()');assert.equal(scale,(600-16)/1000,'longer resume labels/font metrics still fit');
shell.clientHeight=0;t.run('fitDreamHome()');assert(Number.isFinite(scale),'hidden layout does not poison the transform');
for(const id of ['theme-toggle','dream-classic','dream-story','dream-stats'])assert(html.includes('id="'+id+'"'),'all menu controls retained');
assert(html.includes(':root[data-dream-screen="home"] body{position:fixed;inset:0;'),'Home cannot scroll the document');
assert(html.includes('min-height:0;margin:0;padding:0;overflow:hidden;overscroll-behavior:none'),'old minimum height and padding cannot grow Home');
assert(html.includes("homeResize.observe($('dream-shell'));homeResize.observe($('dream-home'))"),'viewport and content resize refit');
assert(html.includes('document.fonts.ready.then(fitDreamHome)'),'offline font loading refits');
console.log('PASS dev7: Home fit at short/tall/large-text sizes, route return, content resize, zero-size guard, all controls retained and Home-only document lock.');
`;
new Function('require','__dirname','process',helper+'\n'+checks)(require,__dirname,process);
