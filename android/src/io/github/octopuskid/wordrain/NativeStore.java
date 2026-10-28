package io.github.octopuskid.wordrain;
import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONObject;
import org.json.JSONArray;
import java.io.File;
import java.util.Map;

final class NativeStore {
 final SharedPreferences prefs;JSONObject records,story,settings,audio;boolean dark;
 NativeStore(Context context){
  prefs=context.getSharedPreferences("word-rain-native",0);
  if(!prefs.getBoolean("legacy-import-v1",false)){
   File dir=new File(context.getApplicationInfo().dataDir,"app_webview/Default/Local Storage/leveldb");
   Map<String,String> old=LegacyStore.read(dir);SharedPreferences.Editor edit=prefs.edit();
   for(Map.Entry<String,String> entry:old.entrySet())if(!prefs.contains(entry.getKey()))edit.putString(entry.getKey(),entry.getValue());
   // Keep all Chromium files untouched, including if a partial/corrupt file was skipped.
   edit.putBoolean("legacy-import-v1",true).apply();
  }
  reload();
 }
 void reload(){
  records=json("word-rain-mobile-records-v1");story=json("word-rain-story-v2");settings=json("word-rain-settings-v1");audio=json("word-rain-audio-v1");dark=!"light".equals(prefs.getString("word-rain-theme","dark"));
 }
 Map<String,String> snapshot(){Map<String,String> values=new java.util.LinkedHashMap<String,String>();for(String key:SaveBackup.KEYS)values.put(key,prefs.getString(key,SaveBackup.jsonKey(key)?"{}":key.endsWith("theme")?"dark":key.endsWith("rick-unlocked-v1")?"false":""));return values;}
 void restore(Map<String,String> values)throws java.io.IOException{
  Map<String,String> before=new java.util.LinkedHashMap<String,String>();for(String key:SaveBackup.KEYS)if(prefs.contains(key))before.put(key,prefs.getString(key,""));
  SharedPreferences.Editor edit=prefs.edit();for(String key:SaveBackup.KEYS){if(values.containsKey(key))edit.putString(key,values.get(key));else edit.remove(key);}
  if(!edit.commit()){SharedPreferences.Editor rollback=prefs.edit();for(String key:SaveBackup.KEYS){if(before.containsKey(key))rollback.putString(key,before.get(key));else rollback.remove(key);}rollback.commit();throw new java.io.IOException("Could not save imported data");}reload();
 }
 JSONObject json(String key){try{return new JSONObject(prefs.getString(key,"{}"));}catch(Exception bad){return new JSONObject();}}
 void put(String key,Object value){prefs.edit().putString(key,String.valueOf(value)).apply();}
 void saveRecords(){put("word-rain-mobile-records-v1",records);}
 JSONObject word(String name){JSONObject words=records.optJSONObject("words");if(words==null){words=new JSONObject();set(records,"words",words);}JSONObject w=words.optJSONObject(name);if(w==null){w=new JSONObject();set(words,name,w);}return w;}
 void met(String name){JSONObject w=word(name);set(w,"met",Math.max(0,w.optInt("met"))+1);saveRecords();}
 void perfect(String name){JSONObject w=word(name);set(w,"perfect",Math.max(0,w.optInt("perfect"))+1);saveRecords();}
 void score(int score){if(score>records.optDouble("highScore",0)){set(records,"highScore",score);saveRecords();}}
 int completed(){int n=story.optInt("completed");return n>=0&&n<=3?n:0;}
 int checkpoint(int chapter){JSONArray a=story.optJSONArray("checkpoints");int value=a==null?0:a.optInt(chapter);return completed()>chapter||value<0||value>=GameData.STORY_WORDS[chapter].length?0:value;}
 void checkpoint(int chapter,int next){if(chapter<completed())return;JSONArray a=story.optJSONArray("checkpoints");if(a==null)a=new JSONArray();try{while(a.length()<3)a.put(0);a.put(chapter,next);set(story,"checkpoints",a);put("word-rain-story-v2",story);}catch(Exception ignored){}}
 void complete(int chapter){checkpoint(chapter,0);set(story,"completed",Math.max(completed(),chapter+1));put("word-rain-story-v2",story);}
 static void set(JSONObject object,String key,Object value){try{object.put(key,value);}catch(Exception ignored){}}
}
