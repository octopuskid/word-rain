const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
for(const name of ['src/index.html','index.html','test.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 const match=html.match(/const wordSets=(\{[\s\S]*?\})(?:;|,allWords)/);assert(match,'word sets in '+name);
 const sets=vm.runInNewContext('('+match[1]+')');
 assert.deepEqual(Object.keys(sets),['classic','nature','space','tricky']);
 for(const [key,set]of Object.entries(sets)){
  assert.equal(set.words.length,120,key+' count in '+name);
  assert.equal(new Set(set.words).size,120,key+' duplicates');
  assert(set.words.every(w=>/^[A-Z]{4,7}$/.test(w)),key+' valid Normal words');
  assert(!set.words.includes('RICK'),'secret is not a preset target');
  const hard=set.words.filter(w=>w.length>=6);assert(hard.length>1);assert(hard.every(w=>w.length<=7));
 }
}
const version=fs.readFileSync(path.join(root,'src/index.html'),'utf8').match(/v(\d+\.\d+\.\d+(?:\.\d+)?(?:-[0-9A-Za-z.-]+)?)(?: DEV)? · NO UMBRELLA/)[1];
assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),fs.readFileSync(path.join(root,'versions/word-rain-'+version+'.html'),'utf8'));
console.log('PASS four 120-entry word sets, per-set uniqueness, Normal/Hard lengths, secret exclusion and matching version snapshot.');
