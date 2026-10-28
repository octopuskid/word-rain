package io.github.octopuskid.wordrain;

import org.json.*;
import java.util.*;
import java.io.*;
import java.nio.ByteBuffer;
import java.nio.charset.*;

/** Versioned, bounded save format. Only gameplay preferences may cross this boundary. */
public final class SaveBackup {
 public static final int MAX_BYTES=1024*1024;
 public static final String RECORDS="word-rain-mobile-records-v1",STORY="word-rain-story-v2",SETTINGS="word-rain-settings-v1",AUDIO="word-rain-audio-v1";
 public static final String[] KEYS={RECORDS,STORY,SETTINGS,AUDIO,"word-rain-theme","word-rain-rick-unlocked-v1","word-rain-tutorial-v1"};
 static boolean jsonKey(String k){return k.equals(RECORDS)||k.equals(STORY)||k.equals(SETTINGS)||k.equals(AUDIO);}
 static void require(boolean ok)throws IOException{if(!ok)throw new IOException("Invalid Word Rain save");}
 static boolean allowed(String key){for(String k:KEYS)if(k.equals(key))return true;return false;}
 static int integer(Object value,int min,int max)throws IOException{require(value instanceof Number);double n=((Number)value).doubleValue();require(!Double.isNaN(n)&&!Double.isInfinite(n)&&n==Math.rint(n)&&n>=min&&n<=max);return (int)n;}
 static void bool(JSONObject o,String k)throws Exception{if(o.has(k))require(o.get(k) instanceof Boolean);}
 static void choice(JSONObject o,String k,String... values)throws Exception{if(!o.has(k))return;Object v=o.get(k);require(v instanceof String&&Arrays.asList(values).contains(v));}
 static void validate(String key,JSONObject o)throws Exception{
  if(key.equals(RECORDS)){
   if(o.has("highScore")){Object v=o.get("highScore");require(v instanceof Number);double n=((Number)v).doubleValue();require(!Double.isNaN(n)&&!Double.isInfinite(n)&&n>=0&&n<=1e15);}
   if(o.has("words")){Object words=o.get("words");require(words instanceof JSONObject);JSONObject ws=(JSONObject)words;require(ws.length()<=10000);Iterator<String> it=ws.keys();while(it.hasNext()){String word=it.next();require(word.matches("[A-Za-z]{1,32}"));Object record=ws.get(word);require(record instanceof JSONObject);JSONObject w=(JSONObject)record;for(String k:new String[]{"met","perfect"})if(w.has(k))integer(w.get(k),0,Integer.MAX_VALUE);}}
  }else if(key.equals(STORY)){
   if(o.has("completed"))integer(o.get("completed"),0,3);
   if(o.has("checkpoints")){Object value=o.get("checkpoints");require(value instanceof JSONArray);JSONArray a=(JSONArray)value;require(a.length()<=3);for(int i=0;i<a.length();i++)integer(a.get(i),0,GameData.STORY_WORDS[i].length-1);}
  }else if(key.equals(SETTINGS)){
   choice(o,"wordSet","classic","nature","space","tricky");choice(o,"difficulty","normal","hard");choice(o,"colorTheme","classic","nature","space","tricky","rick");for(String k:new String[]{"handwriting","overcast","magnet"})bool(o,k);
  }else if(key.equals(AUDIO)){bool(o,"bgm");bool(o,"sfx");choice(o,"track","original","carefree","monkeys","local");}
 }
 public static String encode(Map<String,String> values)throws IOException{
  try{JSONObject data=new JSONObject();for(String key:KEYS)if(values.containsKey(key)){String value=values.get(key);data.put(key,jsonKey(key)?new JSONObject(value):value);}JSONObject root=new JSONObject();root.put("format","word-rain-save");root.put("version",1);root.put("data",data);String text=root.toString(2)+"\n";decode(text.getBytes(StandardCharsets.UTF_8));return text;}catch(IOException e){throw e;}catch(Exception e){throw new IOException("Cannot export save",e);}
 }
 public static Map<String,String> decode(byte[] bytes)throws IOException{
  require(bytes!=null&&bytes.length>0&&bytes.length<=MAX_BYTES);
  try{
   String text=StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes)).toString();
   if(text.startsWith("\uFEFF"))text=text.substring(1);
   int depth=0;boolean quoted=false,escaped=false;char quote=0;
   for(int i=0;i<text.length();i++){char c=text.charAt(i);if(quoted){if(escaped)escaped=false;else if(c=='\\')escaped=true;else if(c==quote)quoted=false;}else if(c=='"'||c=='\''){quoted=true;quote=c;}else if(c=='{'||c=='['){require(++depth<=64);}else if(c=='}'||c==']'){require(--depth>=0);}}
   JSONTokener tokener=new JSONTokener(text);Object parsed=tokener.nextValue();require(parsed instanceof JSONObject&&tokener.nextClean()==0);JSONObject root=(JSONObject)parsed;
   require("word-rain-save".equals(root.get("format")));integer(root.get("version"),1,1);Object d=root.get("data");require(d instanceof JSONObject);JSONObject data=(JSONObject)d;
   require(data.has(RECORDS)&&data.has(STORY));Map<String,String> values=new LinkedHashMap<String,String>();Iterator<String> it=data.keys();while(it.hasNext()){
    String key=it.next();require(allowed(key));Object value=data.get(key);
    if(jsonKey(key)){require(value instanceof JSONObject);validate(key,(JSONObject)value);values.put(key,value.toString());}
    else{require(value instanceof String);String s=(String)value;if(key.endsWith("theme"))require(s.equals("dark")||s.equals("light"));else if(key.endsWith("rick-unlocked-v1"))require(s.equals("true")||s.equals("false"));else require(s.equals("done")||s.equals(""));values.put(key,s);}
   }return values;
  }catch(IOException e){throw e;}catch(Exception e){throw new IOException("Invalid Word Rain save",e);}
 }
 public static byte[] read(InputStream input)throws IOException{
  if(input==null)throw new IOException("Cannot open save");ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] buffer=new byte[8192];int n;while((n=input.read(buffer))!=-1){if(out.size()+n>MAX_BYTES)throw new IOException("Save exceeds 1 MB");out.write(buffer,0,n);}return out.toByteArray();
 }
}
