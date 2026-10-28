package io.github.octopuskid.wordrain;
import android.content.*;
import org.json.*;
import java.util.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class SaveBackupTest{
 static int assertions;static void check(boolean b,String label){assertions++;if(!b)throw new AssertionError(label);}
 static class Prefs implements SharedPreferences{
  Map<String,Object> data=new LinkedHashMap<String,Object>();int commits;boolean fail;
  public boolean getBoolean(String k,boolean d){return data.containsKey(k)?(Boolean)data.get(k):d;}public String getString(String k,String d){return data.containsKey(k)?(String)data.get(k):d;}public boolean contains(String k){return data.containsKey(k);}
  public Editor edit(){return new Editor(){Map<String,Object> set=new LinkedHashMap<String,Object>();Set<String> remove=new HashSet<String>();public Editor putString(String k,String v){set.put(k,v);return this;}public Editor putBoolean(String k,boolean v){set.put(k,v);return this;}public Editor remove(String k){remove.add(k);return this;}public void apply(){commit();}public boolean commit(){commits++;for(String k:remove)data.remove(k);data.putAll(set);boolean ok=!fail;fail=false;return ok;}};}
 }
 static class Ctx extends Context{final Prefs p;Ctx(Prefs p){this.p=p;}public SharedPreferences getSharedPreferences(String n,int m){return p;}}
 static byte[] bytes(String s){return s.getBytes(StandardCharsets.UTF_8);}
 static void reject(String s)throws Exception{try{SaveBackup.decode(bytes(s));throw new AssertionError("accepted invalid backup");}catch(IOException expected){assertions++;}}
 public static void main(String[] args)throws Exception{
  Prefs p=new Prefs();p.data.put("legacy-import-v1",true);p.data.put("untouched-private-key","keep");NativeStore store=new NativeStore(new Ctx(p));
  store.met("RAIN");store.perfect("RAIN");store.score(367);store.checkpoint(1,23);store.complete(0);store.put("word-rain-theme","light");store.put("word-rain-rick-unlocked-v1","true");store.put("word-rain-tutorial-v1","done");
  NativeStore.set(store.settings,"difficulty","hard");store.put(SaveBackup.SETTINGS,store.settings);NativeStore.set(store.audio,"track","carefree");store.put(SaveBackup.AUDIO,store.audio);
  String backup=SaveBackup.encode(store.snapshot());Map<String,String> decoded=SaveBackup.decode(bytes(backup));check(decoded.size()==7,"all gameplay preferences");check(!backup.contains("untouched-private-key")&&!backup.contains("legacy-import-v1"),"private and migration keys excluded");
  Prefs other=new Prefs();other.data.put("legacy-import-v1",true);NativeStore restored=new NativeStore(new Ctx(other));int before=other.commits;restored.restore(decoded);check(other.commits==before+1,"single atomic write");check(restored.records.optDouble("highScore")==367,"best score");check(restored.records.getJSONObject("words").getJSONObject("RAIN").getInt("perfect")==1,"word records");check(restored.completed()==1&&restored.checkpoint(1)==23,"Story state");check(!restored.dark&&restored.settings.getString("difficulty").equals("hard"),"appearance/settings");check(restored.audio.getString("track").equals("carefree"),"audio preference");check(SaveBackup.decode(bytes("\uFEFF"+backup)).size()==7,"UTF8 BOM supported");
  Map<String,Object> old=new LinkedHashMap<String,Object>(p.data);p.fail=true;try{store.restore(decoded);throw new AssertionError("write failure accepted");}catch(IOException expected){}check(p.data.equals(old),"failed commit rolls memory back");check(p.data.get("untouched-private-key").equals("keep"),"non-game preferences retained");
  StringBuilder deep=new StringBuilder();for(int i=0;i<100;i++)deep.append("[");for(int i=0;i<100;i++)deep.append("]");reject(deep.toString());
  reject("not json");reject(backup+"trailing");reject("[]");reject(new JSONObject(backup).put("format","another-game").toString());reject(new JSONObject(backup).put("version",2).toString());reject(new JSONObject(backup).put("version","1").toString());reject(new JSONObject(backup).put("data",new JSONArray()).toString());
  JSONObject bad=new JSONObject(backup);bad.getJSONObject("data").put("release-check","private");reject(bad.toString());bad=new JSONObject(backup);bad.getJSONObject("data").remove(SaveBackup.RECORDS);reject(bad.toString());
  bad=new JSONObject(backup);bad.getJSONObject("data").put(SaveBackup.RECORDS,"{}");reject(bad.toString());
  for(Object score:new Object[]{-1,"100",true}){bad=new JSONObject(backup);bad.getJSONObject("data").getJSONObject(SaveBackup.RECORDS).put("highScore",score);reject(bad.toString());}
  bad=new JSONObject(backup);bad.getJSONObject("data").getJSONObject(SaveBackup.RECORDS).getJSONObject("words").getJSONObject("RAIN").put("met",1.5);reject(bad.toString());
  for(Object complete:new Object[]{-1,4,1.5,"2"}){bad=new JSONObject(backup);bad.getJSONObject("data").getJSONObject(SaveBackup.STORY).put("completed",complete);reject(bad.toString());}
  bad=new JSONObject(backup);bad.getJSONObject("data").getJSONObject(SaveBackup.STORY).put("checkpoints",new JSONArray("[0,50,0]"));reject(bad.toString());
  bad=new JSONObject(backup);bad.getJSONObject("data").getJSONObject(SaveBackup.SETTINGS).put("overcast","true");reject(bad.toString());
  bad=new JSONObject(backup);bad.getJSONObject("data").getJSONObject(SaveBackup.SETTINGS).put("wordSet","fake");reject(bad.toString());
  bad=new JSONObject(backup);bad.getJSONObject("data").put("word-rain-theme","invalid");reject(bad.toString());
  try{SaveBackup.decode(new byte[]{(byte)0xc3,0x28});throw new AssertionError("bad UTF8");}catch(IOException expected){assertions++;}
  try{SaveBackup.read(new ByteArrayInputStream(new byte[SaveBackup.MAX_BYTES+1]));throw new AssertionError("large file");}catch(IOException expected){assertions++;}
  check(Arrays.equals(SaveBackup.read(new ByteArrayInputStream(bytes(backup))),bytes(backup)),"stream round trip");check(p.data.equals(old),"validation never mutates saved data");
  System.out.println("PASS save backup: "+assertions+" checks for round-trip, isolated allowlist, atomic replacement/rollback, checkpoints, invalid formats/types/ranges/UTF8 and bounded streaming.");
 }
}
