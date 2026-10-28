const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const ecj=process.argv[2],json=process.argv[3];if(!ecj||!json)throw Error('Usage: node android/tests/save-backup.cjs /path/to/ecj.jar /path/to/json-20240303.jar');
const root=path.resolve(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'word-rain-save-'));
try{
 const java=path.join(root,'src/io/github/octopuskid/wordrain');const support=path.join(__dirname,'support/android');
 const sources=['GameData.java','LegacyStore.java','SaveBackup.java','NativeStore.java'].map(n=>path.join(java,n));sources.push(path.join(support,'content/Context.java'),path.join(support,'content/SharedPreferences.java'),path.join(support,'content/pm/ApplicationInfo.java'),path.join(__dirname,'SaveBackupTest.java'));
 cp.execFileSync('java',['-jar',path.resolve(ecj),'-17','-cp',path.resolve(json),'-d',temp,...sources],{stdio:'inherit'});
 cp.execFileSync('java',['-cp',temp+path.delimiter+path.resolve(json),'io.github.octopuskid.wordrain.SaveBackupTest'],{stdio:'inherit'});
}finally{fs.rmSync(temp,{recursive:true,force:true});}
