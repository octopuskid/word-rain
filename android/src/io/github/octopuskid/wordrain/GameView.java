package io.github.octopuskid.wordrain;
import android.view.*;
import android.graphics.*;
import java.util.ArrayList;

/** Native portrait playfield. Input is delivered directly to this View. */
class GameView extends View {
 final MainActivity activity;final GameEngine engine;final Paint p=new Paint(3);final RectF field=new RectF();
 long last;int pointer=-1;final ArrayList<float[]> particles=new ArrayList<float[]>();
 GameView(MainActivity activity,GameEngine engine){super(activity);this.activity=activity;this.engine=engine;setFocusable(true);setFocusableInTouchMode(true);setContentDescription("Falling letters. Drag to move the basket and catch the highlighted letter.");}
 int accent(){if(engine.story())return Color.rgb(167,148,203);if(engine.settings.handwriting)return Color.rgb(36,75,161);String[] colors={"#c6f077","#62ddb0","#78baff","#ffae98","#dc9855"};return Color.parseColor(colors[Math.min(4,Math.max(0,engine.settings.palette))]);}
 void text(Canvas c,String value,float x,float y,float size,int color,Typeface font){p.setColor(color);p.setTextSize(size);p.setTypeface(font);p.setTextAlign(Paint.Align.CENTER);p.setStyle(Paint.Style.FILL);c.drawText(value,x,y,p);}
 void burst(){for(int i=0;i<12;i++)particles.add(new float[]{(float)engine.x,470,(float)(Math.random()-.5)*190,(float)(Math.random()-.5)*190,.5f});}
 @Override protected void onDraw(Canvas canvas){super.onDraw(canvas);long now=System.nanoTime();double dt=last==0?0:Math.min(.04,(now-last)/1e9);last=now;engine.update(dt);
  float scale=Math.min(getWidth()/480f,getHeight()/530f),w=scale*480,h=scale*530;field.set((getWidth()-w)/2,(getHeight()-h)/2,(getWidth()+w)/2,(getHeight()+h)/2);
  canvas.save();canvas.translate(field.left,field.top);canvas.scale(scale,scale);
  // Crop the visible Classic board around the basket; keep simulation scale/timing.
  canvas.clipRect(0,engine.story()?0:-28,480,engine.story()?530:490);
  boolean paper=!engine.story()&&engine.settings.handwriting,dark=activity.store.dark&&!paper;
  canvas.drawColor(Color.parseColor(paper?"#f7f3e8":engine.story()?(dark?"#222b43":"#eef3ff"):(dark?"#162934":"#e6efe9")));
  p.setColor(paper?0x44746b65:dark?0x0fffffff:0x180d2830);p.setStrokeWidth(1);for(int y=paper?24:20;y<530;y+=paper?31:40)canvas.drawLine(0,y,480,y,p);if(!paper)for(int x=25;x<480;x+=40)canvas.drawLine(x,0,x,530,p);
  if(!engine.story())drawBackgroundWord(canvas,dark,paper);
  if(engine.pulse>0){p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(2);p.setColor(0x99249fd2);canvas.drawCircle((float)engine.x,470,126*(1-(float)engine.pulse*.3f),p);p.setStyle(Paint.Style.FILL);}
  for(GameEngine.Drop d:engine.drops){if(d.caught)continue;canvas.save();canvas.translate((float)d.x,(float)d.y);if(paper)canvas.rotate((float)Math.sin(d.x*.07)*2);
   int color=d.kind==GameEngine.BOMB?Color.rgb(255,124,131):d.kind==GameEngine.SHIELD?Color.rgb(88,166,255):d.kind==GameEngine.WILD?Color.rgb(190,133,255):d.kind==GameEngine.MAGNET?Color.WHITE:accent();
   if(engine.story())color=d.kind==GameEngine.BOMB?Color.rgb(183,171,201):d.letter==engine.needed()?Color.rgb(255,247,217):Color.rgb(224,228,241);
   p.setColor(paper&&d.kind==GameEngine.LETTER?Color.rgb(246,242,231):color);canvas.drawRoundRect(-18,-20,18,20,paper?5:11,paper?7:11,p);
   if(paper){p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(1.6f);p.setColor(0xff322a2d);canvas.drawRoundRect(-18,-20,18,20,5,7,p);p.setStyle(Paint.Style.FILL);}
   if(d.kind==GameEngine.MAGNET){p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(7);p.setColor(0xffb9c6cd);Path path=new Path();path.moveTo(-8,-12);path.lineTo(-8,4);path.cubicTo(-8,19,8,19,8,4);path.lineTo(8,-12);canvas.drawPath(path,p);p.setColor(0xfff05f6b);canvas.drawLine(-8,-12,-8,-5,p);p.setColor(0xff1eb4ed);canvas.drawLine(8,-12,8,-5,p);p.setStyle(Paint.Style.FILL);}
   else if(d.kind==GameEngine.SHIELD){Path path=new Path();path.moveTo(-10,-11);path.lineTo(10,-11);path.lineTo(9,1);path.quadTo(7,9,0,14);path.quadTo(-8,9,-9,1);path.close();p.setColor(0xff17332b);canvas.drawPath(path,p);}
   else text(canvas,d.kind==GameEngine.BOMB?"×":d.kind==GameEngine.WILD?"✦":String.valueOf(d.letter),0,8,paper?30:25,0xff17332b,paper?activity.handFont:Typeface.DEFAULT_BOLD);
   canvas.restore();
  }
  if(!engine.story()&&engine.settings.overcast){p.setColor(dark?0xe2152631:0xe2eef2f0);canvas.drawRect(0,132,480,397,p);p.setColor(dark?0x24678190:0x44ffffff);canvas.drawOval(-90,125,330,240,p);canvas.drawOval(170,300,600,415,p);}
  float basket=(float)engine.x,y=engine.story()?486:470;
  p.setColor(accent());p.setStrokeWidth(5);p.setStyle(Paint.Style.STROKE);Path basketPath=new Path();basketPath.moveTo(basket-39,y-14);basketPath.lineTo(basket-34,y+10);basketPath.quadTo(basket,y+15,basket+34,y+10);basketPath.lineTo(basket+39,y-14);canvas.drawPath(basketPath,p);p.setStyle(Paint.Style.FILL);canvas.drawRoundRect(basket-32,y+7,basket+32,y+15,5,5,p);
  for(int i=particles.size()-1;i>=0;i--){float[] v=particles.get(i);if(engine.state==GameEngine.PLAYING){v[4]-=dt;v[0]+=v[2]*dt;v[1]+=v[3]*dt;}if(v[4]<=0){particles.remove(i);continue;}p.setColor(accent());p.setAlpha((int)(Math.max(0,v[4])*510));canvas.drawRect(v[0],v[1],v[0]+4,v[1]+4,p);}p.setAlpha(255);
  canvas.restore();activity.frame();if(engine.state==GameEngine.PLAYING)postInvalidateOnAnimation();
 }
 void drawBackgroundWord(Canvas canvas,boolean dark,boolean paper){
  String word=PlayPresentation.word(engine);int at=PlayPresentation.progress(engine);Typeface font=paper?activity.handFont:Typeface.DEFAULT_BOLD;
  p.setTypeface(font);float size=engine.rickNext>=0?40:68;p.setTextSize(size);float width=p.measureText(word);if(width>420){size*=420/width;p.setTextSize(size);}
  float[] widths=new float[word.length()];p.getTextWidths(word,widths);float total=0;for(float w:widths)total+=w;float left=240-total/2;
  p.setTextAlign(Paint.Align.LEFT);p.setStyle(Paint.Style.FILL);
  for(int i=0;i<word.length();i++){
   p.setColor(i<at?0x65a790d1:i==at?(dark?0x65ffffff:0x70303a57):engine.doubleScore?0x40ffe267:(dark?0x26ffffff:0x30303a57));
   canvas.drawText(word.substring(i,i+1),left,275,p);
   if(i==at){p.setStrokeWidth(2);canvas.drawLine(left,284,left+widths[i],284,p);}left+=widths[i];
  }
  p.setAlpha(255);
 }
 @Override public boolean onTouchEvent(MotionEvent e){int action=e.getActionMasked();if(engine.state!=GameEngine.PLAYING)return true;
  if(action==MotionEvent.ACTION_DOWN){pointer=e.getPointerId(0);getParent().requestDisallowInterceptTouchEvent(true);}
  int at=e.findPointerIndex(pointer);if(at>=0&&field.width()>0&&(action==MotionEvent.ACTION_DOWN||action==MotionEvent.ACTION_MOVE))engine.move((e.getX(at)-field.left)/field.width()*480);
  if(action==MotionEvent.ACTION_UP||action==MotionEvent.ACTION_CANCEL||(action==MotionEvent.ACTION_POINTER_UP&&e.getPointerId(e.getActionIndex())==pointer)){pointer=-1;if(action==MotionEvent.ACTION_UP)performClick();}return true;
 }
 @Override public boolean performClick(){super.performClick();return true;}
 @Override public boolean onKeyDown(int code,KeyEvent event){if(code==KeyEvent.KEYCODE_DPAD_LEFT||code==KeyEvent.KEYCODE_A){engine.move(engine.target-28);return true;}if(code==KeyEvent.KEYCODE_DPAD_RIGHT||code==KeyEvent.KEYCODE_D){engine.move(engine.target+28);return true;}if(code==KeyEvent.KEYCODE_SPACE){activity.pauseGame();return true;}return super.onKeyDown(code,event);}
}
