package io.github.octopuskid.wordrain;

import android.graphics.*;
import android.graphics.drawable.GradientDrawable;
import android.view.*;
import android.widget.*;
import android.text.*;
import android.text.style.*;

/** The dev7 Dream Sans/lavender presentation, implemented with native Views only.
 * This class reads the existing engine/save state; the engine remains the dev11 simulation. */
final class StoryUi {
    final MainActivity a;
    TextView chapter, count, hearts, current, letters, note, completedWords;
    ScrollView reading;int shownWords=-1;
    ProgressBar progress;
    Button music, sound;
    String signature="";
    StoryUi(MainActivity a){this.a=a;}
    int color(String light,String dark){return Color.parseColor(a.store.dark?dark:light);}
    Typeface font(boolean bold){return a.storyFont;}
    TextView text(String value,int size,boolean bold){
        TextView t=new TextView(a);t.setText(value);t.setTextSize(size);t.setTextColor(a.ink());t.setTypeface(font(bold));
        t.setIncludeFontPadding(false);t.setLineSpacing(a.dp(3),1.1f);return t;
    }
    TextView prose(String value){TextView t=text(value,16,false);t.setTypeface(Typeface.DEFAULT);t.setTextColor(color("#646d8b","#b3b8d3"));t.setLineSpacing(a.dp(5),1.25f);return t;}
    TextView kicker(String value){TextView t=text(value,10,true);t.setLetterSpacing(.18f);t.setTextColor(a.muted());return t;}
    GradientDrawable panel(int fill,int radius){GradientDrawable d=new GradientDrawable();d.setColor(fill);d.setCornerRadius(a.dp(radius));d.setStroke(a.dp(1),color("#ffffff","#555a76"));return d;}
    Button action(String value,View.OnClickListener click,boolean primary){
        Button b=new Button(a);b.setAllCaps(false);b.setText(value);b.setTypeface(font(primary));b.setTextSize(14);b.setTextColor(primary?Color.WHITE:a.muted());b.setMinHeight(a.dp(44));b.setMinimumHeight(a.dp(44));b.setPadding(a.dp(12),a.dp(8),a.dp(12),a.dp(8));
        b.setBackground(primary?panel(color("#716599","#80719f"),28):new android.graphics.drawable.ColorDrawable(Color.TRANSPARENT));b.setOnClickListener(click);return b;
    }
    void put(LinearLayout parent,View view,int gap){LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.bottomMargin=a.dp(gap);parent.addView(view,p);}
    void center(TextView t){t.setGravity(Gravity.CENTER);}
    LinearLayout begin(String route,boolean scroll){
        LinearLayout p=a.begin(route,scroll);p.setPadding(a.dp(22),a.dp(12),a.dp(22),a.dp(16));
        a.root.addView(new Sky(a),0,new android.widget.FrameLayout.LayoutParams(-1,-1));return p;
    }
    void orb(LinearLayout p,String symbol){
        TextView t=text(symbol,48,false);center(t);t.setTextColor(color("#9683bd","#d5c5ec"));
        GradientDrawable glow=new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{color("#fffef6","#514563"),color("#d2caed","#3d3e60")});glow.setShape(GradientDrawable.OVAL);t.setBackground(glow);
        LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(a.dp(100),a.dp(100));lp.gravity=Gravity.CENTER;lp.topMargin=a.dp(18);lp.bottomMargin=a.dp(24);p.addView(t,lp);
    }
    void chapters(){
        a.pauseGame();LinearLayout p=begin("chapters",true);put(p,action("← Home",v->a.home(),false),12);put(p,kicker("FOLLOW THE STORY"),10);put(p,text("A sky of small stories.",32,true),12);
        TextView art=text("☾\n✧     ✦     ✧",44,false);center(art);art.setTextColor(color("#9c91bf","#bcabdb"));put(p,art,18);
        put(p,prose("Ten scattered words, then two prewritten stories. One glowing letter at a time."),20);
        for(int i=0;i<3;i++){
            final int index=i;boolean unlocked=i<=a.store.completed();LinearLayout card=new LinearLayout(a);card.setOrientation(1);card.setPadding(a.dp(20),a.dp(18),a.dp(20),a.dp(18));card.setBackground(panel(color("#eaffffff","#df2d334c"),22));
            put(card,kicker("CHAPTER 0"+(i+1)+" · "+GameData.STORY_WORDS[i].length+" WORDS"),7);put(card,text(GameData.STORY_TITLES[i],20,true),8);
            String status=i<a.store.completed()?"Complete · Play again":unlocked?(a.store.checkpoint(i)>0?"Continue · "+a.store.checkpoint(i)+" / "+GameData.STORY_WORDS[i].length+" words":"Ready · Enter the dream →"):"Finish the previous chapter to unlock";
            TextView state=text(status,12,false);state.setTextColor(a.muted());put(card,state,0);card.setAlpha(unlocked?1:.45f);card.setEnabled(unlocked);card.setFocusable(unlocked);card.setClickable(unlocked);card.setContentDescription("Chapter "+(i+1)+". "+GameData.STORY_TITLES[i]+". "+status);card.setOnClickListener(v->{if(unlocked)a.intro(index);});put(p,card,13);
        }
        put(p,prose("Every completed word is saved on this device."),0);
    }
    void intro(final int index){
        if(index>a.store.completed())return;LinearLayout p=begin("intro",true);put(p,action("← Chapters",v->a.chapters(),false),18);put(p,kicker("CHAPTER 0"+(index+1)),4);orb(p,"✧");put(p,text(GameData.STORY_TITLES[index],34,true),16);put(p,prose(GameData.STORY_INTROS[index]),20);
        LinearLayout mission=new LinearLayout(a);mission.setOrientation(1);mission.setPadding(a.dp(20),a.dp(18),a.dp(20),a.dp(18));mission.setBackground(panel(color("#99ffffff","#df2d334c"),22));put(mission,kicker("YOUR LITTLE MISSION"),10);
        put(mission,text((index==0?"Complete 10 unrelated words.":"Follow a "+GameData.STORY_WORDS[index].length+" word story in order.")+(a.store.checkpoint(index)>0?" Continue from word "+(a.store.checkpoint(index)+1)+".":""),17,true),10);
        put(mission,prose("The next word is already chosen. Complete the word shown above the playfield, then the next word appears. Drag the basket and catch the glowing letter in order. A wrong letter or × costs a heart; missed blocks are harmless. Retries resume from your next word with three fresh hearts."),0);put(p,mission,20);
        put(p,action("Enter the dream →",v->{a.game=a.storyGame;a.game.startStory(index,a.store.checkpoint(index));a.playScreen();},true),0);
    }
    void result(){
        a.audio.sync(false);GameEngine g=a.game;int index=g.storyChapter;boolean won=g.state==GameEngine.WON;LinearLayout p=begin("result",true);
        put(p,kicker(won?"A LITTLE MORE LIGHT":"THE DREAM IS STILL HERE"),12);orb(p,"✦");put(p,text(won?(index==2?"Every word, restored.":"Chapter complete."):"Rest, then try again.",34,true),18);
        put(p,prose(won?(index==0?"Ten words collected. Now you are ready to turn falling letters into a complete story.":GameData.STORY_TEXT[index]):"The rain grew too restless this time. Your completed words are safe. Take a breath and continue from the next word with three fresh hearts."),24);
        put(p,action(won?(index==2?"Back to the sky →":"Next chapter →"):"Continue chapter →",v->{if(won&&index==2)a.home();else a.intro(index+(won?1:0));},true),12);put(p,action("Chapter selection",v->a.chapters(),false),0);
    }
    void play(){
        LinearLayout p=begin("play",false);a.endPosted=false;signature="";shownWords=-1;a.targetSignature="";
        LinearLayout header=new LinearLayout(a);Button back=action("← Home",v->a.home(),false);header.addView(back,new LinearLayout.LayoutParams(0,a.dp(44),1));
        music=action("",v->{a.audio.bgm=!a.audio.bgm;a.audio.save();a.audio.sync(a.game.state==GameEngine.PLAYING);frame();},false);header.addView(music,new LinearLayout.LayoutParams(0,a.dp(44),1));
        sound=action("",v->{a.audio.sfx=!a.audio.sfx;a.audio.save();frame();},false);header.addView(sound,new LinearLayout.LayoutParams(0,a.dp(44),1));
        a.pauseButton=action("Ⅱ",v->{if(a.game.state==GameEngine.PAUSED)resume();else a.pauseGame();},false);a.pauseButton.setContentDescription("Pause story");header.addView(a.pauseButton,new LinearLayout.LayoutParams(a.dp(44),a.dp(44)));put(p,header,8);
        chapter=kicker("CHAPTER 0"+(a.game.storyChapter+1)+" · "+GameData.STORY_TITLES[a.game.storyChapter]);put(p,chapter,10);
        LinearLayout live=new LinearLayout(a);live.setGravity(Gravity.CENTER_VERTICAL);count=text("",13,false);count.setTextColor(a.muted());hearts=text("",24,true);hearts.setGravity(Gravity.END);hearts.setTextColor(color("#a27cac","#d1abd7"));
        live.addView(count,new LinearLayout.LayoutParams(0,a.dp(34),1));live.addView(hearts,new LinearLayout.LayoutParams(-2,a.dp(34)));put(p,live,8);
        progress=new ProgressBar(a,null,android.R.attr.progressBarStyleHorizontal);progress.setMax(a.game.words.size());progress.setProgressTintList(android.content.res.ColorStateList.valueOf(0xffa599c7));progress.setProgressBackgroundTintList(android.content.res.ColorStateList.valueOf(color("#dcdcec","#454b65")));progress.setContentDescription("Chapter progress");LinearLayout.LayoutParams bar=new LinearLayout.LayoutParams(-1,a.dp(6));bar.bottomMargin=a.dp(12);p.addView(progress,bar);
        TextView caption=kicker("COMPLETE THIS WORD");center(caption);put(p,caption,6);current=text("",26,true);current.setTypeface(Typeface.DEFAULT_BOLD);center(current);current.setMaxLines(1);current.setAutoSizeTextTypeUniformWithConfiguration(16,28,1,android.util.TypedValue.COMPLEX_UNIT_SP);put(p,current,4);
        letters=text("",26,true);letters.setTypeface(Typeface.DEFAULT_BOLD);center(letters);letters.setLetterSpacing(.12f);letters.setMaxLines(1);letters.setAutoSizeTextTypeUniformWithConfiguration(14,28,1,android.util.TypedValue.COMPLEX_UNIT_SP);put(p,letters,10);
        a.arena=new FrameLayout(a);a.arena.setBackground(panel(color("#eef3ff","#222b43"),26));a.arena.setClipToOutline(true);a.gameView=new StoryGameView(a,a.game);a.arena.addView(a.gameView,new FrameLayout.LayoutParams(-1,-1));p.addView(a.arena,new LinearLayout.LayoutParams(-1,0,1));
        note=text("",12,false);note.setTextColor(a.muted());note.setPadding(0,a.dp(8),0,0);put(p,note,0);
        completedWords=null;reading=null;if(a.game.storyChapter>0){
            TextView heading=kicker("YOUR STORY SO FAR");heading.setPadding(0,a.dp(8),0,a.dp(6));put(p,heading,0);
            completedWords=prose("");completedWords.setTextSize(14);completedWords.setPadding(a.dp(12),a.dp(8),a.dp(12),a.dp(8));
            reading=new ScrollView(a);reading.setBackground(panel(color("#99ffffff","#df2d334c"),16));reading.addView(completedWords);p.addView(reading,new LinearLayout.LayoutParams(-1,a.dp(90)));
        }
        pause(a.game.state==GameEngine.PAUSED);frame();a.gameView.requestFocus();a.audio.sync(a.game.state==GameEngine.PLAYING);
    }
    void resume(){a.game.resume();pause(false);a.gameView.last=0;a.gameView.invalidate();a.audio.sync(true);}
    void pause(boolean on){
        if(a.arena==null)return;if(a.pauseOverlay!=null){a.arena.removeView(a.pauseOverlay);a.pauseOverlay=null;}if(a.pauseButton!=null){a.pauseButton.setText(on?"▷":"Ⅱ");a.pauseButton.setContentDescription(on?"Resume story":"Pause story");}if(!on)return;
        LinearLayout overlay=new LinearLayout(a);overlay.setOrientation(1);overlay.setGravity(Gravity.CENTER);overlay.setPadding(a.dp(24),a.dp(16),a.dp(24),a.dp(16));overlay.setBackgroundColor(color("#eef2effb","#ee25283b"));
        TextView title=text("A quiet moment.",26,true);center(title);put(overlay,title,10);TextView copy=prose("Your dream can wait.");center(copy);put(overlay,copy,18);put(overlay,action("Keep dreaming →",v->resume(),true),10);put(overlay,action("Return to chapters",v->{a.game.state=GameEngine.OVER;a.chapters();},false),0);a.pauseOverlay=overlay;a.arena.addView(overlay,new FrameLayout.LayoutParams(-1,-1));
    }
    void update(TextView view,String value){if(!view.getText().toString().equals(value))view.setText(value);}
    void frame(){
        GameEngine g=a.game;if(!a.screen.equals("play")||!g.story())return;
        update(count,g.wordIndex+" / "+g.words.size()+" words");String hp="";for(int i=0;i<3;i++)hp+=i<g.hearts?"♥ ":"♡ ";update(hearts,hp.trim());hearts.setContentDescription(g.hearts+" hearts");progress.setProgress(g.wordIndex);
        if(completedWords!=null&&shownWords!=g.wordIndex){shownWords=g.wordIndex;StringBuilder story=new StringBuilder();String[] tokens=GameData.STORY_TOKENS[g.storyChapter];for(int i=0;i<Math.min(g.wordIndex,tokens.length);i++){if(i>0)story.append(' ');story.append(tokens[i]);}completedWords.setText(story.length()==0?"Your completed words will appear here.":story.toString());reading.post(()->reading.fullScroll(View.FOCUS_DOWN));}
        update(music,"♫ "+(a.audio.bgm?"On":"Off"));music.setContentDescription("Story background music "+(a.audio.bgm?"on":"off"));update(sound,"♪ "+(a.audio.sfx?"On":"Off"));sound.setContentDescription("Story sound effects "+(a.audio.sfx?"on":"off"));
        String next=g.wordIndex+":"+g.progress;if(!next.equals(signature)){signature=next;current.setText(PlayPresentation.word(g));current.setContentDescription("Current word: "+PlayPresentation.word(g));String word=g.word();SpannableString span=new SpannableString(word);
            for(int i=0;i<word.length();i++){span.setSpan(new ForegroundColorSpan(i<g.progress?color("#776794","#bcabdb"):i==g.progress?color("#3c466c","#fff2d7"):color("#a5adc3","#8995b6")),i,i+1,0);if(i==g.progress)span.setSpan(new UnderlineSpan(),i,i+1,0);}letters.setText(span);letters.setContentDescription("Catch "+g.needed()+". "+g.progress+" of "+word.length()+" letters completed.");}
        if(!note.getText().toString().equals(g.feedback))note.setText(g.feedback);
        if((g.state==GameEngine.OVER||g.state==GameEngine.WON)&&!a.endPosted){a.endPosted=true;a.audio.sync(false);a.root.post(()->{if(a.screen.equals("play")&&a.game==g)a.result();});}
    }
    /** Decoration never intercepts input; it lives below the actual controls. */
    static final class Sky extends View {
        final MainActivity a;final Paint p=new Paint(3);
        Sky(MainActivity a){super(a);this.a=a;setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);}
        @Override protected void onDraw(Canvas c){float w=getWidth(),h=getHeight();p.setColor(a.store.dark?0x14e2d5ed:0x88fffcec);c.drawCircle(w*.96f,h*.13f,w*.21f,p);p.setColor(a.store.dark?0x12a6afd5:0x4dffffff);c.drawOval(-w*.25f,h*.28f,w*.42f,h*.37f,p);c.drawOval(w*.7f,h*.82f,w*1.4f,h*.93f,p);p.setColor(a.store.dark?0xffa89ac5:0xffb9aed5);p.setTextSize(a.dp(22));c.drawText("✧",w*.12f,h*.14f,p);c.drawText("✦",w*.9f,h*.44f,p);c.drawText("✧",w*.08f,h*.9f,p);}
    }
}
