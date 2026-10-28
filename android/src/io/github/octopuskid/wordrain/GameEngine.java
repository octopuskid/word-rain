package io.github.octopuskid.wordrain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Random;

/** Platform-independent rules. Coordinates and timing match the portrait Classic game. */
public final class GameEngine {
    public static final int READY=0, PLAYING=1, PAUSED=2, OVER=3, WON=4;
    public static final int LETTER=0, BOMB=1, SHIELD=2, WILD=3, MAGNET=4;
    public static final double BASKET_BOTTOM=485;
    public static final String RICK="dQw4w9WgXcQ";
    public static class Events {
        public void sound(String id){} public void damage(boolean hp,boolean shield){}
        public void met(String word){} public void perfect(String word){}
        public void score(int value){} public void checkpoint(int chapter,int next){}
        public void complete(int chapter){} public void unlockRick(){}
    }
    public static final class Settings {
        public boolean hard,overcast,magnet,handwriting; public int wordSet,palette;
    }
    public static final class Drop {
        public double x,y,speed; public int kind; public char letter; public boolean pull,caught,missed,magnetResolved;
        public Drop(double x,double y,double speed,int kind,char letter){this.x=x;this.y=y;this.speed=speed;this.kind=kind;this.letter=letter;}
    }
    private static final class Balance {
        double[] credit; int[] weights;
        int choose(int[] next){
            if(!java.util.Arrays.equals(weights,next)){weights=next;credit=new double[next.length];}
            int best=-1,total=0;for(int i=0;i<next.length;i++){credit[i]+=next[i];total+=next[i];if(next[i]>0&&(best<0||credit[i]>credit[best]))best=i;}
            credit[best]-=total;return best;
        }
    }
    public final Events events; public final Random random; public Settings settings=new Settings();
    public final ArrayList<Drop> drops=new ArrayList<Drop>(); public final ArrayList<String> words=new ArrayList<String>();
    public int state=READY,score,hearts=3,shield,progress,wordIndex,wrongStreak,perfectWords,perfectRun;
    public int storyChapter=-1,rickNext=-1,rickCaught; public boolean rickMissed;
    public boolean wordPerfect=true,wildcard,doubleScore,scoringPaused;
    public double speed=1,x=240,target=240,elapsed,spawn=.4,pulse,invulnerable;
    public String feedback="Catch the highlighted letter.",rickInput="";
    private final Balance letters=new Balance();
    public GameEngine(Random random,Events events){this.random=random;this.events=events;}
    public boolean story(){return storyChapter>=0;}
    public String word(){return words.isEmpty()?"":words.get(Math.min(wordIndex,words.size()-1));}
    public char needed(){return word().isEmpty()?' ':word().charAt(Math.min(progress,word().length()-1));}
    public double base(){return settings.hard?1.4:1;}
    public int points(int base){return (int)Math.ceil(Math.round(base*(settings.hard?2:1)*(settings.overcast?2:1)*speed*1000000)/1000000.0);}
    private void reset(){state=PLAYING;score=0;hearts=3;shield=0;progress=0;wordIndex=0;wrongStreak=0;perfectWords=0;perfectRun=0;wordPerfect=true;wildcard=false;doubleScore=false;scoringPaused=false;x=target=240;elapsed=0;spawn=.4;pulse=0;invulnerable=0;drops.clear();rickNext=-1;rickInput="";letters.weights=null;feedback="Catch the highlighted letter.";}
    public void startClassic(Settings chosen){
        settings=chosen;storyChapter=-1;reset();speed=base();words.clear();
        for(String w:GameData.WORDS[Math.max(0,Math.min(3,chosen.wordSet))])if(!chosen.hard||w.length()>=6)words.add(w);
        Collections.shuffle(words,random);events.met(word());
    }
    public void startStory(int chapter,int checkpoint){
        settings=new Settings();storyChapter=chapter;reset();speed=1;words.clear();Collections.addAll(words,GameData.STORY_WORDS[chapter]);
        wordIndex=Math.max(0,Math.min(words.size()-1,checkpoint));
    }
    public void pause(){if(state==PLAYING)state=PAUSED;}
    public void resume(){if(state==PAUSED)state=PLAYING;}
    public void move(double value){target=Math.max(story()?45:42,Math.min(story()?435:438,value));}
    private void add(int amount){score+=amount;events.score(score);}
    public void setSpeed(double value){double previous=speed;speed=Math.max(base(),Math.min(settings.hard?2.6:2.2,Math.round(value*100)/100.0));spawn*=frequency(previous)/frequency(speed);for(Drop d:drops)d.speed*=speed/previous;if(speed>previous)events.sound("speedUp");}
    private double frequency(double value){return 1+.03*Math.max(0,(value-base())/.2);}
    private void breakPerfect(){wordPerfect=false;perfectWords=perfectRun=0;doubleScore=false;}
    private void finishWord(){
        if(wordPerfect){events.perfect(word());perfectRun++;if(perfectRun>=6)doubleScore=true;perfectWords++;if(!wildcard)events.sound("wildcardMode");wildcard=true;if(perfectRun%6==0&&hearts<3){hearts++;events.sound("regen");}}
        else{perfectWords=perfectRun=0;doubleScore=false;}
        if(perfectWords==2){perfectWords=0;setSpeed(speed+.2);}wordPerfect=true;
    }
    private void correct(boolean wild){
        events.sound(wild?"wildcard":"correct");boolean recovering=scoringPaused;scoringPaused=false;wrongStreak=0;
        if(!recovering)add(points(doubleScore?20:10));progress++;
        if(progress==word().length()){
            String completed=word();int award=points(doubleScore?100:50);events.sound(wordPerfect?"perfect":"completed");finishWord();add(award);progress=0;wordIndex++;
            if(wordIndex==words.size()){Collections.shuffle(words,random);wordIndex=0;if(words.size()>1&&word().equals(completed))Collections.swap(words,0,1);}
            events.met(word());feedback=completed+" complete! +"+award+" · Catch "+needed();
        }else feedback=(recovering?"Scoring resumed. ":wild?"Wildcard! ":"Nice! ")+"Catch "+needed();
    }
    private void wrong(){
        boolean protectedCatch=shield>0;events.sound("wrong");wrongStreak=Math.min(3,wrongStreak+1);
        if(protectedCatch)shield--;else{breakPerfect();wildcard=false;}
        if(!protectedCatch&&(settings.hard||wrongStreak>=3))progress=0;
        scoringPaused=wrongStreak>=3;int award=scoringPaused?0:points(1);add(award);setSpeed(speed-.05);
        feedback=(scoringPaused?"Scoring paused. ":"Wrong letter! +"+award+". ")+(protectedCatch?"Shield protected perfection. ":"Perfection lost. ")+"Catch "+needed();
    }
    public void catchDrop(Drop d){
        if(state!=PLAYING)return;
        if(story()){
            if(d.kind!=BOMB&&d.letter==needed()){
                progress++;events.sound("correct");feedback="A little more light.";
                if(progress==word().length()){progress=0;wordIndex++;drops.clear();spawn=.6;events.sound("completed");feedback="Word complete. Follow the next word.";if(wordIndex==words.size()){state=WON;events.complete(storyChapter);}else events.checkpoint(storyChapter,wordIndex);}
            }else{hearts--;events.sound("loseHP");events.damage(true,false);feedback="One heart lost. Catch only the glowing letter.";if(hearts==0)state=OVER;}
            return;
        }
        int beforeHP=hearts,beforeShield=shield;
        if(d.magnetResolved)return;
        if(d.kind==MAGNET){
            pulse=.5;int count=0,letters=0,extra=0;boolean bomb=false,wild=false;
            String eligible=word().substring(progress,Math.min(word().length(),progress+2));
            ArrayList<Drop> selected=new ArrayList<Drop>();
            for(Drop other:drops)if(other!=d&&!other.caught&&!other.magnetResolved&&!other.missed&&other.y<=BASKET_BOTTOM&&Math.hypot(other.x-d.x,other.y-d.y)<=126){
                other.pull=true;other.magnetResolved=true;selected.add(other);count++;
                if(other.kind==LETTER){if(eligible.indexOf(other.letter)>=0)letters++;else extra++;}
                if(other.kind==BOMB)bomb=true;if(other.kind==WILD)wild=true;
            }
            // Resolve a pulse atomically: duplicates/order cannot alter its snapshot.
            if(bomb){hearts=Math.max(0,hearts-1);invulnerable=1;}
            if(wild){wordPerfect=true;int n=word().length()-progress;for(int i=0;i<n;i++)correct(true);}
            else{int n=Math.min(letters,word().length()-progress);for(int i=0;i<n;i++)correct(false);}
            if(extra>0)add(extra);
            // Pickups in a pulse retain their normal behavior, once each.
            for(Drop other:selected)if(other.kind==SHIELD){boolean done=other.magnetResolved;other.magnetResolved=false;catchDrop(other);other.magnetResolved=done;}
            events.sound("magnet");feedback="Magnet! "+count+" blocks · "+(wild?"Perfect word!":letters+" letters")+" · +"+extra+(bomb?" · One heart lost":"");
        }
        else if(d.kind==SHIELD){events.sound("shield");int cost=shield==2?2:shield==1?1:0;hearts=Math.max(0,hearts-cost);shield=cost>0?(settings.hard&&shield==2?1:0):2;feedback=cost>0?"Shield overload! Lost "+cost+" hearts.":"Full shield equipped!";}
        else if(d.kind==BOMB){int old=shield;if(old!=1)breakPerfect();if(old!=2)hearts--;if(old==0)progress=0;shield=0;setSpeed(speed-.2);invulnerable=1;feedback=old==2?"Shield shattered; heart saved.":old==1?"Half shield shattered; perfection kept.":"Heart lost; word reset.";}
        else if(d.kind==WILD||d.letter==needed())correct(d.kind==WILD);else wrong();
        if(hearts<beforeHP)events.sound("loseHP");if(beforeShield>0&&shield==0)events.sound("shatter");if(hearts<beforeHP||(beforeShield>0&&shield==0))events.damage(hearts<beforeHP,beforeShield>0&&shield==0);
        if(hearts<=0){hearts=0;state=OVER;}
        if(state==PLAYING){if(d.kind!=LETTER)rickInput="";else{rickInput=(rickInput+d.letter);if(rickInput.length()>4)rickInput=rickInput.substring(rickInput.length()-4);if(rickInput.equals("RICK")){rickNext=0;rickCaught=0;rickMissed=false;spawn=.45;drops.clear();rickInput="";feedback="Catch d Q w 4 w 9 W g X c Q — no points.";}}}
    }
    public boolean overlap(Drop a,Drop b){boolean magnet=a.kind==MAGNET||b.kind==MAGNET;return !a.magnetResolved&&!b.magnetResolved&&!a.caught&&!b.caught&&a.y>=0&&b.y>=0&&a.y<489&&b.y<489&&(magnet?Math.abs(a.x-b.x)<=36&&Math.abs(a.y-b.y)<=40:Math.abs(a.x-b.x)<36&&Math.abs(a.y-b.y)<40);}
    public void resolveOverlaps(){
        if(story()||rickNext>=0||state!=PLAYING)return;
        boolean changed=true;while(changed){changed=false;
            outer:for(int i=0;i<drops.size();i++)for(int j=i+1;j<drops.size();j++){
                Drop a=drops.get(i),b=drops.get(j);if(!overlap(a,b))continue;
                int ka=a.kind,kb=b.kind,merged=-1,reward=0;Drop keep=null;
                if(ka==MAGNET||kb==MAGNET){if(ka!=SHIELD&&kb!=SHIELD&&!(ka==MAGNET&&kb==MAGNET))keep=ka==MAGNET?b:a;}
                else if(ka==SHIELD||kb==SHIELD){if(ka==SHIELD&&kb==SHIELD)merged=SHIELD;else keep=ka==SHIELD?b:a;}
                else if(ka==WILD&&kb==WILD)reward=2;
                else if((ka==WILD&&kb==BOMB)||(kb==WILD&&ka==BOMB))reward=1;
                else if(ka==LETTER&&kb==LETTER)merged=WILD;
                else if(ka==BOMB&&kb==BOMB)merged=BOMB;
                else if(ka==BOMB||kb==BOMB)keep=ka==BOMB?b:a;
                else keep=ka==WILD?a:b;
                if(keep!=null)drops.remove(keep==a?j:i);else{drops.remove(j);drops.remove(i);if(merged>=0){Drop d=new Drop((a.x+b.x)/2,(a.y+b.y)/2,(a.speed+b.speed)/2,merged,' ');d.missed=a.missed||b.missed;d.pull=!d.missed&&(a.pull||b.pull);drops.add(d);}}
                if(reward>0){rickInput="";if(reward==2)wordPerfect=true;int count=reward==2?word().length()-progress:1;for(int n=0;n<count;n++)correct(true);}
                changed=true;break outer;
            }
        }
    }
    private char randomLetter(){
        char correct=needed(),next=progress+1<word().length()?word().charAt(progress+1):' ';
        int slot=letters.choose(new int[]{settings.hard?8:20,next==' '?0:5,100-(settings.hard?8:20)-(next==' '?0:5)});
        if(slot==0)return correct;if(slot==1)return next;
        StringBuilder pool=new StringBuilder();for(char c='A';c<='Z';c++)if(c!=correct&&c!=next)pool.append(c);return pool.charAt(random.nextInt(pool.length()));
    }
    public void spawnDrop(){
        boolean bomb=random.nextDouble()<.28;if(bomb&&random.nextDouble()>=.5)return;if(!bomb&&random.nextDouble()>=.65)return;
        // Separate 1% shares of emitted blocks, independent of hazard roll.
        double pickup=random.nextDouble();if(pickup<.02)bomb=false;
        int kind=pickup<.01?MAGNET:pickup<.02?SHIELD:bomb?BOMB:wildcard&&random.nextDouble()<(settings.hard?.005:.01)?WILD:LETTER;
        drops.add(new Drop(28+random.nextDouble()*424,-25,(130+Math.min(160,elapsed*2)+random.nextDouble()*45)*.6*speed,kind,kind==LETTER?randomLetter():' '));
    }
    public void update(double dt){
        if(state!=PLAYING)return;dt=Math.min(.04,Math.max(0,dt));pulse=Math.max(0,pulse-dt);invulnerable=Math.max(0,invulnerable-dt);
        x+=(target-x)*Math.min(1,(story()?16:18)*dt);spawn-=dt;
        if(rickNext>=0){updateRick(dt);return;}elapsed+=dt;
        if(spawn<=0){
            if(story()){double[] hazards={0,.10,.16},speeds={76,94,110};boolean hazard=random.nextDouble()<hazards[storyChapter];char c=hazard?'×':random.nextDouble()<.72?needed():(char)('A'+random.nextInt(26));
                // Story retains its original 360x430 timing, mapped onto the Classic board.
                Drop d=new Drop((24+random.nextDouble()*312)*480/360,-24*530.0/430,(speeds[storyChapter]+random.nextDouble()*16)*530/430,hazard?BOMB:LETTER,c);drops.add(d);spawn+=1.05;
            }else{double roll=random.nextDouble();int count=roll<.03?3:roll<.18?2:1;for(int i=0;i<count;i++)spawnDrop();spawn+=Math.max(.28,.77-elapsed*.005)*1.21/1.05/frequency(speed);}
        }
        for(Drop d:drops){if(d.y>BASKET_BOTTOM){d.missed=true;d.pull=false;}if(d.pull){double dx=x-d.x,dy=470-d.y,dist=Math.hypot(dx,dy),step=Math.min(dist,Math.max(480,d.speed*2)*dt);if(dist>0){d.x+=dx/dist*step;d.y+=dy/dist*step;}}else d.y+=d.speed*dt;if(d.y>BASKET_BOTTOM){d.missed=true;d.pull=false;}}
        resolveOverlaps();
        for(int i=drops.size()-1;i>=0;i--){Drop d=drops.get(i);double min=story()?370*530.0/430:446,max=story()?412*530.0/430:489,width=story()?37*480.0/360:45;
            if(d.y>min&&d.y<max&&Math.abs(d.x-x)<width){drops.remove(i);int old=wordIndex;catchDrop(d);if(state!=PLAYING||rickNext>=0||(story()&&wordIndex!=old))break;}
            else if(d.y>(story()?460*530.0/430:560))drops.remove(i);
        }
    }
    private void updateRick(double dt){
        if(drops.isEmpty()&&spawn<=0)drops.add(new Drop(42+random.nextDouble()*396,-25,170,LETTER,RICK.charAt(rickNext)));
        if(drops.isEmpty())return;Drop d=drops.get(0);d.y+=d.speed*dt;
        if(!d.caught&&d.y>446&&d.y<489&&Math.abs(d.x-x)<45){d.caught=true;rickCaught++;events.sound("correct");feedback="Caught "+d.letter+" · "+rickCaught+" / 11";}
        if(d.y>489){if(!d.caught)rickMissed=true;drops.clear();rickNext++;spawn=.2;if(rickNext==RICK.length()){rickNext=-1;spawn=.65;if(!rickMissed&&rickCaught==RICK.length()){events.unlockRick();feedback="Rick theme unlocked!";}else{state=OVER;feedback="A Rick symbol slipped past.";}}}
    }
}
