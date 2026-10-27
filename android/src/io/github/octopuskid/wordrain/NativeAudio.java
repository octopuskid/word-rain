package io.github.octopuskid.wordrain;
import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.*;
import java.io.File;
import java.util.HashMap;

final class NativeAudio {
 final MainActivity activity;final NativeStore store;final SoundPool effects;final AudioManager manager;
 final HashMap<String,Integer> sounds=new HashMap<String,Integer>();MediaPlayer player;
 boolean bgm,sfx,playing,focused;String selected="original";File local;
 final AudioManager.OnAudioFocusChangeListener focus;
 NativeAudio(MainActivity activity,NativeStore store){this.activity=activity;this.store=store;bgm=store.audio.optBoolean("bgm",false);sfx=store.audio.optBoolean("sfx",true);selected=store.audio.optString("track","original");if(!selected.equals("original")&&!activity.downloadedMusic(activity.musicFile(selected)==null?"missing":activity.musicFile(selected)).isFile())selected="original";
  manager=(AudioManager)activity.getSystemService(Context.AUDIO_SERVICE);
  focus=new AudioManager.OnAudioFocusChangeListener(){public void onAudioFocusChange(int change){if(change<0){focused=false;activity.pauseGame();}}};
  effects=new SoundPool.Builder().setMaxStreams(8).setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()).build();
  for(String name:new String[]{"correct","wrong","magnet","shield","wildcard","completed","perfect","wildcardMode","speedUp","regen","loseHP","shatter"})try{AssetFileDescriptor f=activity.getAssets().openFd("audio/"+name+".wav");sounds.put(name,effects.load(f,1));f.close();}catch(Exception ignored){}
 }
 void save(){NativeStore.set(store.audio,"bgm",bgm);NativeStore.set(store.audio,"sfx",sfx);NativeStore.set(store.audio,"track",selected.equals("local")?"original":selected);store.put("word-rain-audio-v1",store.audio);}
 void sound(String id){Integer value=sounds.get(id);if(sfx&&value!=null)effects.play(value,1,1,1,0,1);}
 void select(String id){selected=id;releasePlayer();save();sync(playing);}
 void releasePlayer(){if(player!=null){player.release();player=null;}}
 void sync(boolean running){playing=running;boolean active=running&&bgm;
  if(!active){if(player!=null)try{player.pause();}catch(Exception ignored){}if(focused){manager.abandonAudioFocus(focus);focused=false;}return;}
  if(!focused){focused=manager.requestAudioFocus(focus,AudioManager.STREAM_MUSIC,AudioManager.AUDIOFOCUS_GAIN)==AudioManager.AUDIOFOCUS_REQUEST_GRANTED;if(!focused)return;}
  try{if(player==null){player=new MediaPlayer();player.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
    if(selected.equals("original")){AssetFileDescriptor f=activity.getAssets().openFd("audio/original.wav");player.setDataSource(f.getFileDescriptor(),f.getStartOffset(),f.getLength());f.close();}
    else{File file=selected.equals("local")?local:activity.downloadedMusic(activity.musicFile(selected));player.setDataSource(file.getAbsolutePath());}
    player.setLooping(true);player.setVolume(.22f,.22f);player.setOnErrorListener(new MediaPlayer.OnErrorListener(){public boolean onError(MediaPlayer mp,int what,int extra){activity.runOnUiThread(new Runnable(){public void run(){releasePlayer();selected="original";save();activity.toast("Music unavailable. Using Pocket Forecast.");sync(playing);}});return true;}});player.prepare();}
   if(!player.isPlaying())player.start();
  }catch(Exception unavailable){releasePlayer();if(!selected.equals("original")){selected="original";save();sync(running);}}
 }
 void close(){sync(false);releasePlayer();effects.release();}
}
