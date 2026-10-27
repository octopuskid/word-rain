package io.github.octopuskid.wordrain;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.os.Handler;
import android.os.Looper;
import org.json.JSONArray;
import java.net.URL;
import java.io.File;
import java.io.FileOutputStream;
import java.security.MessageDigest;
import javax.net.ssl.HttpsURLConnection;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.os.VibrationEffect;
import org.json.JSONObject;
import android.view.WindowInsets;
import android.view.View;
import android.widget.Toast;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/** Native Android edition: Android Views, Canvas, pure Java rules, and native audio. */
public final class MainActivity extends Activity {
    NativeStore store;NativeAudio audio;GameEngine game,classicGame,storyGame;GameView gameView;android.widget.ProgressBar speedBar,shieldBar;
    android.graphics.Typeface dreamFont,handFont;android.widget.FrameLayout root;
    android.widget.TextView hud,targetLabel,feedback;android.widget.LinearLayout page;
    android.widget.Button pauseButton;android.widget.FrameLayout arena;
    android.view.View pauseOverlay;String screen="home",targetSignature="";boolean endPosted;
    private static final int MUSIC_PICKER=132;private boolean choosingMusic,downloadingMusic;
    private final Handler updates=new Handler(Looper.getMainLooper());
    private ConnectivityManager connectivity;private boolean foreground,checkingUpdate,launchUpdateAttempted;
    int dp(float n){return Math.round(n*getResources().getDisplayMetrics().density);}
    int ink(){return Color.parseColor(store.dark?"#eeedf9":"#303658");}
    int muted(){return Color.parseColor(store.dark?"#b3b8d3":"#747c99");}
    void toast(String text){Toast.makeText(this,text,Toast.LENGTH_LONG).show();}
    android.graphics.drawable.GradientDrawable rounded(int color,int radius){android.graphics.drawable.GradientDrawable d=new android.graphics.drawable.GradientDrawable();d.setColor(color);d.setCornerRadius(dp(radius));d.setStroke(dp(1),store.dark?0x44747794:0xddffffff);return d;}
    android.widget.TextView label(String text,int size,boolean bold){android.widget.TextView v=new android.widget.TextView(this);v.setText(text);v.setTextColor(ink());v.setTextSize(size);v.setTypeface(bold?android.graphics.Typeface.DEFAULT_BOLD:dreamFont);v.setPadding(0,dp(5),0,dp(5));return v;}
    android.widget.Button button(String text,View.OnClickListener listener){android.widget.Button b=new android.widget.Button(this);b.setText(text);b.setAllCaps(false);b.setTextSize(15);b.setTextColor(ink());b.setTypeface(dreamFont,android.graphics.Typeface.BOLD);b.setBackground(rounded(store.dark?0xff373b58:0xfff8f8ff,22));b.setPadding(dp(16),dp(9),dp(16),dp(9));b.setMinHeight(dp(44));b.setOnClickListener(listener);return b;}
    void add(android.widget.LinearLayout to,View view){android.widget.LinearLayout.LayoutParams p=new android.widget.LinearLayout.LayoutParams(-1,-2);p.bottomMargin=dp(10);to.addView(view,p);}
    void background(){root.setBackground(new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.TL_BR,store.dark?new int[]{0xff191c35,0xff202d46,0xff30283f}:new int[]{0xfff3f3ff,0xffe7effb,0xffece3f6}));}
    android.widget.LinearLayout begin(String route,boolean scrolling){screen=route;root.removeAllViews();background();page=new android.widget.LinearLayout(this);page.setOrientation(1);page.setPadding(dp(20),dp(12),dp(20),dp(12));if(scrolling){android.widget.ScrollView scroll=new android.widget.ScrollView(this);scroll.setFillViewport(true);scroll.addView(page);root.addView(scroll,new android.widget.FrameLayout.LayoutParams(-1,-1));}else root.addView(page,new android.widget.FrameLayout.LayoutParams(-1,-1));return page;}
    void home(){pauseGame();screen="home";root.removeAllViews();background();root.addView(new NativeHome(this),new android.widget.FrameLayout.LayoutParams(-1,-1));}
    void openLink(String url){try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url)));}catch(ActivityNotFoundException missing){toast("No browser installed");}}
    void saveSettings(GameEngine.Settings s){NativeStore.set(store.settings,"wordSet",GameData.SET_IDS[s.wordSet]);NativeStore.set(store.settings,"difficulty",s.hard?"hard":"normal");NativeStore.set(store.settings,"colorTheme",s.palette<4?GameData.SET_IDS[s.palette]:"rick");NativeStore.set(store.settings,"handwriting",s.handwriting);NativeStore.set(store.settings,"overcast",s.overcast);NativeStore.set(store.settings,"magnet",s.magnet);store.put("word-rain-settings-v1",store.settings);}
    GameEngine.Settings settings(){GameEngine.Settings s=new GameEngine.Settings();String id=store.settings.optString("wordSet","classic"),palette=store.settings.optString("colorTheme","classic");for(int i=0;i<4;i++){if(GameData.SET_IDS[i].equals(id))s.wordSet=i;if(GameData.SET_IDS[i].equals(palette))s.palette=i;}if("rick".equals(palette)&&"true".equals(store.prefs.getString("word-rain-rick-unlocked-v1","false")))s.palette=4;s.hard=store.settings.optString("difficulty").equals("hard");s.overcast=store.settings.optBoolean("overcast");s.magnet=store.settings.optBoolean("magnet");s.handwriting=store.settings.optBoolean("handwriting");return s;}
    android.widget.Spinner spinner(String[] values,int selected){android.widget.Spinner v=new android.widget.Spinner(this);v.setAdapter(new android.widget.ArrayAdapter<String>(this,android.R.layout.simple_spinner_dropdown_item,values));v.setSelection(selected);v.setMinimumHeight(dp(48));return v;}
    android.widget.Switch toggle(String name,boolean value){android.widget.Switch s=new android.widget.Switch(this);s.setText(name);s.setTextColor(ink());s.setChecked(value);s.setPadding(0,dp(8),0,dp(8));s.setMinHeight(dp(48));return s;}
    void classic(){pauseGame();game=classicGame;if(game.state==GameEngine.PAUSED||game.state==GameEngine.PLAYING){playScreen();return;}setup();}
    void setup(){pauseGame();game=classicGame;begin("classic",true);add(page,button("← Home",v->home()));android.widget.TextView title=label("word rain.",32,true);title.setOnClickListener(v->openLink("https://github.com/octopuskid/word-rain"));add(page,title);add(page,label("Choose your difficulty, then let it rain.",15,false));if(game.state==GameEngine.OVER&&!game.story())add(page,label("Rain check? Score "+game.score+" · "+game.feedback,17,true));
      final GameEngine.Settings s=settings();add(page,label("Difficulty",13,true));final android.widget.Spinner difficulty=spinner(new String[]{"Normal · 4–7 letters","Hard · 6–7 letters"},s.hard?1:0);add(page,difficulty);add(page,label("Word set",13,true));final android.widget.Spinner set=spinner(GameData.SET_NAMES,s.wordSet);add(page,set);
      add(page,label("Color theme",13,true));boolean rick="true".equals(store.prefs.getString("word-rain-rick-unlocked-v1","false"));final android.widget.Spinner palette=spinner(rick?new String[]{"Lime","Mint","Blue","Coral","Rick · Copper"}:new String[]{"Lime","Mint","Blue","Coral"},s.palette);add(page,palette);
      final android.widget.Switch paper=toggle("Handwriting paper",s.handwriting),cloud=toggle("Overcast · double points",s.overcast),magnet=toggle("Magnet blocks · 1%",s.magnet);add(page,paper);add(page,cloud);add(page,magnet);palette.setEnabled(!s.handwriting);paper.setOnCheckedChangeListener((b,on)->palette.setEnabled(!on));
      add(page,button("Start game →",v->{s.hard=difficulty.getSelectedItemPosition()==1;s.wordSet=set.getSelectedItemPosition();s.palette=palette.getSelectedItemPosition();s.handwriting=paper.isChecked();s.overcast=cloud.isChecked();s.magnet=magnet.isChecked();saveSettings(s);game.startClassic(s);playScreen();}));
      add(page,button("Music & sound",v->music()));add(page,button("Replay tutorial",v->tutorial(0)));add(page,button("How to play",v->rules()));add(page,label("Native Android · 2.0-dev10 DEV · build 49",11,false));
    }
    void rules(){new AlertDialog.Builder(this).setTitle("Catch words. Chase your best.").setMessage("Drag the basket or use A/D / arrow keys. Catch the underlined letter in order. Missed blocks are harmless. × costs one heart.\n\nCorrect +10; word +50; wrong +1 until three consecutive mistakes pause scoring. The next correct catch recovers without letter points. Awards multiply by speed, Hard ×2 and Overcast ×2, rounded up.\n\nTwo perfect words add 20% speed. Six unlock 2× points and restore one heart. Wrong letters subtract 5% speed; × subtracts 20%.\n\nA full shield saves a heart against × but breaks perfection. A half shield loses one heart but keeps perfection. Wrong letters use half a shield and preserve progress/perfection. Picking up a shield while protected costs hearts.\n\nLetters overlap into wildcards. Wildcard + × fills a letter; two wildcards perfect a word. Magnets pull all nearby blocks within 3.5 block widths, excluding centers below the basket. Touching another block destroys a magnet; a shield disappears with it.").setPositiveButton("Got it",null).show();}
    void chapters(){pauseGame();begin("chapters",true);add(page,button("← Home",v->home()));add(page,label("Follow the story.",30,true));add(page,label("Ten scattered words, then two prewritten stories.",15,false));for(int i=0;i<3;i++){final int chapter=i;android.widget.Button b=button("CHAPTER 0"+(i+1)+" · "+GameData.STORY_WORDS[i].length+" WORDS\n"+GameData.STORY_TITLES[i]+"\n"+(i<store.completed()?"Complete · Play again":i==store.completed()?"Ready · "+store.checkpoint(i)+" words finished":"Finish the previous chapter"),v->intro(chapter));b.setEnabled(i<=store.completed());add(page,b);}add(page,label("Every completed word is saved on this device.",13,false));}
    void story(){pauseGame();if(storyGame.state==GameEngine.PAUSED){game=storyGame;playScreen();return;}chapters();}
    void intro(final int chapter){if(chapter>store.completed())return;begin("intro",true);add(page,button("← Chapters",v->chapters()));add(page,label("CHAPTER 0"+(chapter+1),13,true));add(page,label(GameData.STORY_TITLES[chapter],30,true));add(page,label(GameData.STORY_INTROS[chapter],17,false));add(page,label("The current full word appears before you catch letters. Finish it to advance to the next word. Drag the basket; avoid wrong letters and ×. Each costs one heart. Completed words are saved; retries resume with three fresh hearts.",16,false));add(page,button("Enter the dream →",v->{game=storyGame;game.startStory(chapter,store.checkpoint(chapter));playScreen();}));}
    void result(){audio.sync(false);begin("result",true);final int chapter=game.storyChapter;boolean won=game.state==GameEngine.WON;add(page,label(won?"Chapter complete.":"Rest, then try again.",30,true));add(page,label(won?(chapter==0?"Ten words collected. Now follow a complete story.":GameData.STORY_TEXT[chapter]):"Your completed words are safe. Continue from the next word with three fresh hearts.",17,false));add(page,button(won?(chapter==2?"Back to the sky →":"Next chapter →"):"Continue chapter →",v->{if(game.state==GameEngine.WON&&chapter==2)home();else intro(chapter+(game.state==GameEngine.WON?1:0));}));add(page,button("Chapters",v->chapters()));}
    void stats(){pauseGame();begin("records",true);add(page,button("← Home",v->home()));add(page,label("Words worth keeping.",28,true));add(page,label("Classic best: "+store.records.optDouble("highScore",0)+"\nStory chapters: "+store.completed()+" / 3",19,true));JSONObject words=store.records.optJSONObject("words");if(words!=null){java.util.ArrayList<String> keys=new java.util.ArrayList<String>();java.util.Iterator<String> it=words.keys();while(it.hasNext())keys.add(it.next());java.util.Collections.sort(keys);for(String key:keys){JSONObject w=words.optJSONObject(key);if(w!=null&&w.optInt("met")>0)add(page,label(key+"   Met "+w.optInt("met")+"   Perfect "+w.optInt("perfect"),15,false));}}
      add(page,button("Reset Classic records",v->new AlertDialog.Builder(this).setTitle("Reset Classic records?").setMessage("This clears your Classic high score and word counts. Story progress is kept.").setNegativeButton("Keep",null).setPositiveButton("Reset",(d,w)->{store.records=new JSONObject();store.saveRecords();stats();}).show()));}
    void playScreen(){begin("play",false);endPosted=false;targetSignature="";android.widget.LinearLayout header=new android.widget.LinearLayout(this);android.widget.Button back=button("← Home",v->home());pauseButton=button(game.state==GameEngine.PAUSED?"Resume":"Pause",v->{if(game.state==GameEngine.PAUSED){game.resume();showPause(false);gameView.last=0;gameView.invalidate();audio.sync(true);}else pauseGame();});header.addView(back,new android.widget.LinearLayout.LayoutParams(0,dp(46),1));header.addView(pauseButton,new android.widget.LinearLayout.LayoutParams(0,dp(46),1));android.widget.Button music=button("♫",v->{pauseGame();music();});header.addView(music,new android.widget.LinearLayout.LayoutParams(dp(48),dp(46)));add(page,header);
      hud=label("",12,false);add(page,hud);
      android.widget.LinearLayout meters=new android.widget.LinearLayout(this);
      speedBar=new android.widget.ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);speedBar.setMax(game.story()?game.words.size():120);speedBar.setProgressTintList(android.content.res.ColorStateList.valueOf(game.story()?0xffa599c7:0xffef4444));speedBar.setContentDescription(game.story()?"Chapter progress":"Falling speed");
      shieldBar=new android.widget.ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);shieldBar.setMax(2);shieldBar.setProgressTintList(android.content.res.ColorStateList.valueOf(0xff58a6ff));shieldBar.setContentDescription("Shield health");
      meters.addView(speedBar,new android.widget.LinearLayout.LayoutParams(0,dp(10),1));if(!game.story()){android.widget.LinearLayout.LayoutParams bar=new android.widget.LinearLayout.LayoutParams(0,dp(10),1);bar.leftMargin=dp(16);meters.addView(shieldBar,bar);}add(page,meters);
      targetLabel=label("",25,true);targetLabel.setGravity(android.view.Gravity.CENTER);targetLabel.setTypeface(game.story()?dreamFont:game.settings.handwriting?handFont:android.graphics.Typeface.DEFAULT_BOLD);add(page,targetLabel);
      arena=new android.widget.FrameLayout(this);gameView=new GameView(this,game);arena.addView(gameView,new android.widget.FrameLayout.LayoutParams(-1,-1));page.addView(arena,new android.widget.LinearLayout.LayoutParams(-1,0,1));
      feedback=label("",12,false);add(page,feedback);showPause(game.state==GameEngine.PAUSED);frame();gameView.requestFocus();audio.sync(game.state==GameEngine.PLAYING);
    }
    void showPause(boolean on){if(arena==null)return;if(pauseOverlay!=null){arena.removeView(pauseOverlay);pauseOverlay=null;}if(pauseButton!=null)pauseButton.setText(on?"Resume":"Pause");if(!on)return;android.widget.LinearLayout overlay=new android.widget.LinearLayout(this);overlay.setOrientation(1);overlay.setGravity(android.view.Gravity.CENTER);overlay.setPadding(dp(24),dp(24),dp(24),dp(24));overlay.setBackgroundColor(store.dark?0xf025283b:0xf0f2effb);add(overlay,label("A quiet moment.",25,true));add(overlay,button("Keep playing →",v->{game.resume();showPause(false);gameView.last=0;gameView.invalidate();audio.sync(true);}));add(overlay,button(game.story()?"Return to chapters":"Give up",v->{if(game.story()){game.state=GameEngine.OVER;chapters();}else new AlertDialog.Builder(this).setTitle("Give up this run?").setNegativeButton("Keep playing",null).setPositiveButton("Give up",(d,w)->{game.state=GameEngine.OVER;setup();}).show();}));pauseOverlay=overlay;arena.addView(overlay,new android.widget.FrameLayout.LayoutParams(-1,-1));}
    void frame(){if(!screen.equals("play"))return;String hp="";for(int i=0;i<3;i++)hp+=i<game.hearts?"♥ ":"♡ ";String h=game.story()?"CHAPTER 0"+(game.storyChapter+1)+" · "+game.wordIndex+" / "+game.words.size()+" words   "+hp:"SCORE "+game.score+"   "+hp+"\nSpeed "+Math.round(game.speed*100)+"% · Shield "+game.shield+"/2 · "+(game.doubleScore?"2× ACTIVE":game.perfectRun+"/6 perfect");if(!hud.getText().toString().equals(h)){android.text.SpannableString hearts=new android.text.SpannableString(h);int heart=h.indexOf('♥');if(heart>=0)hearts.setSpan(new android.text.style.ForegroundColorSpan(game.wildcard?0xffbe85ff:0xffff4d68),heart,h.length(),0);hud.setText(hearts);}speedBar.setProgress(game.story()?game.wordIndex:(int)Math.round((game.speed-game.base())*100));shieldBar.setProgress(game.shield);
      String word=game.rickNext>=0?GameEngine.RICK:game.story()?GameData.STORY_TOKENS[game.storyChapter][Math.min(game.wordIndex,game.words.size()-1)]:game.word();int at=game.rickNext>=0?game.rickNext:game.progress;String signature=word+":"+at+":"+game.doubleScore;if(!signature.equals(targetSignature)){targetSignature=signature;android.text.SpannableString styled=new android.text.SpannableString(word);if(at<word.length()){styled.setSpan(new android.text.style.UnderlineSpan(),at,at+1,0);styled.setSpan(new android.text.style.ForegroundColorSpan(Color.parseColor("#a790d1")),0,at,0);}targetLabel.setText(styled);targetLabel.setBackground(game.doubleScore&&!game.story()?rounded(0x55ffe267,12):null);}
      if(!feedback.getText().toString().equals(game.feedback))feedback.setText(game.feedback);
      if((game.state==GameEngine.OVER||game.state==GameEngine.WON)&&!endPosted){endPosted=true;audio.sync(false);updates.post(()->{if(screen.equals("play")){if(game.story())result();else setup();}});}
    }
    void pauseGame(){if(game!=null)game.pause();if(audio!=null)audio.sync(false);if(screen.equals("play")&&arena!=null)showPause(true);}
    final String[] tutorialTitles={"Welcome to Word Rain","Catch the next letter","Keep your three hearts","Shields and wildcards","Perfect words and speed","Choose your forecast"};
    final String[] tutorialCopy={"Classic is an endless score challenge. Story follows ten practice words, then stories of 50 and 100 words.","Drag the basket across the playfield. The underlined letter is the next one you need. Finish a word to move on; missed blocks are harmless.","Avoid ×. In Story, a wrong letter also costs a heart. In Classic, wrong catches break perfection and three consecutive wrong letters pause scoring.","Blue shields protect you, but picking up a shield while already protected costs hearts. Purple wildcards fill a blank. Overlapping blocks have special rules.","Two consecutive perfect words increase Classic speed. Six unlock double scoring and restore one heart, up to three.","Choose difficulty before starting. Settings stay hidden while playing and paused, and return at game over. Magnets pull nearby hazards too; Overcast hides the board's middle. Story words save individually."};
    void tutorial(int step){pauseGame();begin("tutorial",true);add(page,label("FIRST STEPS · "+(step+1)+" / 6",12,true));add(page,label(tutorialTitles[step],29,true));add(page,label(tutorialCopy[step],18,false));if(step>0)add(page,button("← Back",v->tutorial(step-1)));add(page,button(step==5?"Start dreaming →":"Next →",v->{if(step<5)tutorial(step+1);else finishTutorial();}));add(page,button("Skip tutorial",v->finishTutorial()));}
    void finishTutorial(){store.put("word-rain-tutorial-v1","done");home();}
    void music(){pauseGame();String[] options={(audio.bgm?"Turn BGM off":"Turn BGM on"),(audio.sfx?"Turn SFX off":"Turn SFX on"),"Pocket Forecast · Original","Carefree · Kevin MacLeod","Monkeys Spinning Monkeys · Kevin MacLeod","Choose local BGM · this session","Music credits"};new AlertDialog.Builder(this).setTitle("Music & sound").setItems(options,(dialog,which)->{if(which==0){audio.bgm=!audio.bgm;audio.save();}else if(which==1){audio.sfx=!audio.sfx;audio.save();}else if(which==2)audio.select("original");else if(which==3||which==4){String id=which==3?"carefree":"monkeys";if(downloadedMusic(musicFile(id)).isFile())audio.select(id);else new AlertDialog.Builder(this).setTitle("Download optional music?").setMessage("Download this Kevin MacLeod recording from the Word Rain GitHub repository? Uses Wi-Fi or mobile data. The verified file stays offline on this device. Your game remains paused.").setNegativeButton("Cancel",null).setPositiveButton("Download",(d,w)->downloadMusic(id)).show();}else if(which==5)chooseMusic();else new AlertDialog.Builder(this).setTitle("Music credits").setMessage("Pocket Forecast and synthesized effects: Word Rain / octopuskid & ChatGPT · MIT.\n\nCarefree and Monkeys Spinning Monkeys: Kevin MacLeod (incompetech.com), CC BY 4.0. Optional complete recordings, re-encoded for download size. No endorsement implied.\n\nNunito: SIL Open Font License 1.1.").setPositiveButton("OK",null).setNeutralButton("CC BY 4.0",(d,w)->openLink("https://creativecommons.org/licenses/by/4.0/")).show();audio.sync(false);}).show();}

    @Override protected void onStart() {
        super.onStart();
        foreground = true;
        // One attempt for this launch, including offline/failure. Returning from another
        // app or reconnecting must not start another request during the same session.
        if (!launchUpdateAttempted) {
            launchUpdateAttempted = true;
            connectivity = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
            checkForUpdate();
        }
    }
    @Override protected void onStop() {
        foreground = false;
        super.onStop();
    }
    private void checkForUpdate() {
        if (!foreground || checkingUpdate || connectivity == null) return;
        NetworkCapabilities caps = connectivity.getNetworkCapabilities(connectivity.getActiveNetwork());
        if (caps == null || !caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)) return;
        final SharedPreferences prefs = getSharedPreferences("release-check", MODE_PRIVATE);
        checkingUpdate = true;
        new Thread(new Runnable() { @Override public void run() {
            HttpsURLConnection connection = null;
            String found = null;
            try {
                connection = (HttpsURLConnection) new URL("https://api.github.com/repos/octopuskid/word-rain/releases/latest").openConnection();
                connection.setConnectTimeout(8000); connection.setReadTimeout(8000);
                connection.setInstanceFollowRedirects(false);
                connection.setRequestProperty("Accept", "application/vnd.github+json");
                connection.setRequestProperty("User-Agent", "WordRain-Android");
                if (connection.getResponseCode() != 200) throw new java.io.IOException("Release unavailable");
                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                try (InputStream input = connection.getInputStream()) {
                    byte[] buffer = new byte[4096]; int count;
                    while ((count = input.read(buffer)) != -1) {
                        if (bytes.size() + count > 256 * 1024) throw new java.io.IOException("Release too large");
                        bytes.write(buffer, 0, count);
                    }
                }
                JSONObject release = new JSONObject(new String(bytes.toByteArray(), StandardCharsets.UTF_8));
                String tag = release.getString("tag_name");
                String installed = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
                if (!release.getBoolean("draft") && !release.getBoolean("prerelease") && UpdatePolicy.newer(tag, installed)) {
                    String number = tag.replaceFirst("^v", "");
                    JSONArray assets = release.getJSONArray("assets");
                    // Ignore HTML-only releases even if someone marks one as Latest.
                    boolean apk = false;
                    for (int i = 0; i < assets.length(); i++) {
                        String name = assets.getJSONObject(i).getString("name");
                        apk |= name.equals("word-rain-" + number + ".apk");
                    }
                    if (apk) found = tag;
                }
            } catch (Exception unavailable) { /* Offline, timeout, invalid response or API limit: keep playing. */ }
            finally { if (connection != null) connection.disconnect(); }
            final String version = found;
            updates.post(new Runnable() { @Override public void run() {
                checkingUpdate = false;
                if (version == null || !foreground || isFinishing() || isDestroyed() || game == null) return;
                if (version.equals(prefs.getString("offered-version", ""))) return;
                prefs.edit().putString("offered-version", version).apply();
                pauseGame();
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("Word Rain " + version + " is available")
                    .setMessage("Open GitHub to download the update? Install over this app to keep your records. Downloading uses your Wi-Fi or mobile data. The game will stay paused.")
                    .setNegativeButton("Later", null)
                    .setPositiveButton("View update", new DialogInterface.OnClickListener() {
                        @Override public void onClick(DialogInterface dialog, int which) {
                            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/octopuskid/word-rain/releases/tag/" + version))); }
                            catch (ActivityNotFoundException unavailable) { Toast.makeText(MainActivity.this, "No browser installed", Toast.LENGTH_SHORT).show(); }
                        }
                    }).show();
            }});
        }}, "WordRainUpdateCheck").start();
    }
    String musicFile(String id) {
        return "carefree".equals(id) ? "carefree.mp3" : "monkeys".equals(id) ? "monkeys-spinning-monkeys.mp3" : null;
    }
    File downloadedMusic(String name) { return new File(new File(getFilesDir(), "optional-music"), name); }
    public void downloadMusic(final String id) {
            if (musicFile(id) == null) return;
            runOnUiThread(new Runnable() { @Override public void run() {
                if (downloadingMusic || game == null) return;
                downloadingMusic = true;
                new Thread(new Runnable() { @Override public void run() {
                    HttpsURLConnection connection = null;
                    boolean success = false;
                    String name = musicFile(id);
                    File target = downloadedMusic(name), partial = new File(target.getPath() + ".part");
                    try {
                        File directory = target.getParentFile();
                        if (!directory.isDirectory() && !directory.mkdirs()) throw new java.io.IOException("No download directory");
                        connection = (HttpsURLConnection) new URL("https://raw.githubusercontent.com/octopuskid/word-rain/main/assets/music/" + name).openConnection();
                        connection.setConnectTimeout(10000); connection.setReadTimeout(15000);
                        connection.setInstanceFollowRedirects(false);
                        connection.setRequestProperty("User-Agent", "WordRain-Android");
                        if (connection.getResponseCode() != 200) throw new java.io.IOException("Download unavailable");
                        int expectedSize = "carefree".equals(id) ? 2052446 : 1251775;
                        MessageDigest digest = MessageDigest.getInstance("SHA-256");
                        int total = 0;
                        try (InputStream input = connection.getInputStream(); FileOutputStream output = new FileOutputStream(partial)) {
                            byte[] buffer = new byte[8192]; int count;
                            while ((count = input.read(buffer)) != -1) {
                                total += count;
                                if (total > expectedSize) throw new java.io.IOException("Invalid music size");
                                output.write(buffer, 0, count); digest.update(buffer, 0, count);
                            }
                        }
                        StringBuilder hash = new StringBuilder();
                        for (byte value : digest.digest()) hash.append(String.format(java.util.Locale.ROOT, "%02x", value & 255));
                        String expectedHash = "carefree".equals(id) ? "390e7c47e2cb540809d8c6b0ebf53bb4d22cda5f3ab900325e08187995422457" : "daf792a2d3bc1a592b5b30eab9b61170c1da9b578e28695ace8329238cb81488";
                        if (total != expectedSize || !expectedHash.equals(hash.toString()) || !partial.renameTo(target)) throw new java.io.IOException("Music verification failed");
                        success = true;
                    } catch (Exception unavailable) { /* Keep original music and allow retry. */ }
                    finally { if (connection != null) connection.disconnect(); partial.delete(); }
                    final boolean ready = success;
                    runOnUiThread(new Runnable() { @Override public void run() {
                        downloadingMusic = false;
                        if (audio != null && !isDestroyed()) { if (ready) { audio.select(id); toast("Music downloaded and ready offline."); } else toast("Music download failed. Try again when online."); }
                    }});
                }}, "WordRainMusicDownload").start();
            }});
        }
    public void haptic(String kind) {
            if (!"hp".equals(kind) && !"shield".equals(kind) && !"both".equals(kind)) return;
            if (getResources().getConfiguration().smallestScreenWidthDp >= 600) return;
            try {
                Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
                if (vibrator == null || !vibrator.hasVibrator()) return;
                long[] pattern = "both".equals(kind) ? new long[]{0,110,50,60,35,60}
                    : "hp".equals(kind) ? new long[]{0,130} : new long[]{0,55,35,55};
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
            } catch (RuntimeException unavailable) { /* No vibration support. */ }
        }
    public void chooseMusic() {
            runOnUiThread(new Runnable() { @Override public void run() {
                if (choosingMusic || game == null) return;
                Intent picker = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                picker.addCategory(Intent.CATEGORY_OPENABLE);
                picker.setType("audio/*");
                picker.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try { choosingMusic = true; startActivityForResult(picker, MUSIC_PICKER); }
                catch (ActivityNotFoundException unavailable) {
                    choosingMusic = false;
                    Toast.makeText(MainActivity.this, "No audio picker installed", Toast.LENGTH_SHORT).show();
                }
            }});
        }
    @Override public void onCreate(Bundle state){
        super.onCreate(state);applyDeviceOrientation();store=new NativeStore(this);
        try{dreamFont=android.graphics.Typeface.createFromAsset(getAssets(),"dream.ttf");}catch(Exception absent){dreamFont=android.graphics.Typeface.create("sans-serif-rounded",0);}
        try{handFont=android.graphics.Typeface.createFromAsset(getAssets(),"hand.ttf");}catch(Exception absent){handFont=android.graphics.Typeface.create("cursive",0);}
        root=new android.widget.FrameLayout(this);root.setClipChildren(true);root.setClipToPadding(true);
        root.setOnApplyWindowInsetsListener((view,insets)->{
            if(Build.VERSION.SDK_INT>=30){Insets bars=insets.getInsetsIgnoringVisibility(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout());view.setPadding(bars.left,bars.top+dp(6),bars.right,bars.bottom+dp(6));}
            else view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop()+dp(6),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom()+dp(6));
            return insets.consumeSystemWindowInsets();
        });setContentView(root);root.requestApplyInsets();
        GameEngine.Events events=new GameEngine.Events(){
            @Override public void sound(String id){if(audio!=null)audio.sound(id);if(gameView!=null&&(id.equals("correct")||id.equals("magnet")||id.equals("wildcard")))gameView.burst();}
            @Override public void damage(boolean hp,boolean shield){haptic(hp&&shield?"both":hp?"hp":"shield");}
            @Override public void met(String word){store.met(word);}
            @Override public void perfect(String word){store.perfect(word);}
            @Override public void score(int value){store.score(value);}
            @Override public void checkpoint(int chapter,int next){store.checkpoint(chapter,next);}
            @Override public void complete(int chapter){store.complete(chapter);}
            @Override public void unlockRick(){store.put("word-rain-rick-unlocked-v1","true");}
        };classicGame=new GameEngine(new java.util.Random(),events);storyGame=new GameEngine(new java.util.Random(),events);storyGame.storyChapter=0;game=classicGame;audio=new NativeAudio(this,store);
        if(!"done".equals(store.prefs.getString("word-rain-tutorial-v1","")))tutorial(0);else home();
    }
    @Override protected void onActivityResult(int request,int result,final Intent data){super.onActivityResult(request,result,data);if(request!=MUSIC_PICKER)return;choosingMusic=false;if(result!=RESULT_OK||data==null||data.getData()==null)return;
        new Thread(()->{final File selected=new File(getCacheDir(),"session-music");File partial=new File(getCacheDir(),"session-music.part");boolean success=false;
            try(InputStream input=getContentResolver().openInputStream(data.getData());FileOutputStream output=new FileOutputStream(partial)){if(input==null)throw new java.io.IOException("No audio");byte[] b=new byte[8192];int n,total=0;while((n=input.read(b))!=-1){total+=n;if(total>24*1024*1024)throw new java.io.IOException("Audio too large");output.write(b,0,n);}success=true;}catch(Exception bad){}
            final boolean ready=success&&partial.renameTo(selected);partial.delete();runOnUiThread(()->{if(audio!=null&&!isDestroyed()){if(ready){audio.local=selected;audio.select("local");toast("Local BGM ready for this session.");}else toast("Could not read audio. Choose a file under 24 MB.");}});
        },"WordRainLocalAudio").start();
    }
    private void applyDeviceOrientation(){setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);}
    @Override public void onConfigurationChanged(Configuration configuration){super.onConfigurationChanged(configuration);applyDeviceOrientation();if(screen.equals("home"))home();}
    @Override protected void onPause(){pauseGame();super.onPause();}
    @Override protected void onDestroy(){updates.removeCallbacksAndMessages(null);if(audio!=null){audio.close();audio=null;}super.onDestroy();}
    @Override public void onBackPressed(){if(screen.equals("home")){new AlertDialog.Builder(this).setTitle("Leave Word Rain?").setNegativeButton("Stay",null).setPositiveButton("Exit",(d,w)->finish()).show();}else if(screen.equals("tutorial"))finishTutorial();else home();}
}
