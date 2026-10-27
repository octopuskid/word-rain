package io.github.octopuskid.wordrain;
import android.view.*;
import android.widget.*;
import android.graphics.*;

/** One-screen native menu: every control is measured inside the usable screen. */
final class NativeHome extends ViewGroup {
 final MainActivity activity;final float[][] bounds={{12,12,90,42},{12,67,336,24},{118,112,124,124},{12,254,336,54},{12,314,336,32},{20,376,320,80},{20,468,320,80},{20,560,320,80},{12,686,336,20}};
 final int[] sizes={12,10,0,36,13,20,20,20,10};float scale=1,ox,oy,lastStyled=-1;final Paint p=new Paint(3);
 NativeHome(MainActivity activity){super(activity);this.activity=activity;setClipChildren(true);setContentDescription("Word Rain Home");
  addView(activity.button(activity.store.dark?"☀ Light":"☾ Dark",v->{activity.store.dark=!activity.store.dark;activity.store.put("word-rain-theme",activity.store.dark?"dark":"light");activity.home();}));
  TextView kicker=activity.label("A LITTLE POCKET DAYDREAM",10,true);kicker.setLetterSpacing(.19f);kicker.setGravity(Gravity.CENTER);addView(kicker);
  ImageView logo=new ImageView(activity);try{logo.setImageDrawable(android.graphics.drawable.Drawable.createFromStream(activity.getAssets().open("word-rain-2-logo.png"),null));}catch(Exception ignored){}logo.setScaleType(ImageView.ScaleType.FIT_CENTER);logo.setContentDescription("W2 logo");addView(logo);
  TextView title=activity.label("word rain 2",36,true);title.setTypeface(Typeface.DEFAULT_BOLD);title.setLetterSpacing(-.035f);title.setGravity(Gravity.CENTER);title.setOnClickListener(v->activity.openLink("https://github.com/octopuskid/word-rain"));title.setContentDescription("Word Rain on GitHub");addView(title);
  TextView sub=activity.label("a sky full of unfinished stories",13,false);sub.setGravity(Gravity.CENTER);sub.setTextColor(activity.muted());addView(sub);
  addView(menu("Classic","Catch words. Chase your best.",v->activity.classic(),false));addView(menu("Story mode",activity.storyGame.state==GameEngine.PAUSED?"Resume your dream":"Ten words, then two stories",v->activity.story(),true));addView(menu("Stats","Your words & little milestones",v->activity.stats(),false));
  TextView version=activity.label("2.0-dev12 DEV · made by octopuskid",10,false);version.setGravity(Gravity.CENTER);version.setTextColor(activity.muted());addView(version);
 }
 Button menu(String name,String detail,OnClickListener listener,boolean story){Button b=activity.button(name+"\n"+detail,listener);b.setGravity(Gravity.CENTER_VERTICAL|Gravity.LEFT);b.setTypeface(activity.dreamFont,Typeface.BOLD);b.setBackground(activity.rounded(story?(activity.store.dark?0xff514563:0xffd5ceef):(activity.store.dark?0xff2d334c:0xfff9faff),30));b.setContentDescription(name+". "+detail);return b;}
 @Override protected void onMeasure(int w,int h){int width=MeasureSpec.getSize(w),height=MeasureSpec.getSize(h);setMeasuredDimension(width,height);scale=Math.min(width/360f,height/720f);ox=(width-360*scale)/2;oy=(height-720*scale)/2;
  for(int i=0;i<getChildCount();i++){View child=getChildAt(i);float[] b=bounds[i];child.measure(MeasureSpec.makeMeasureSpec(Math.round(b[2]*scale),MeasureSpec.EXACTLY),MeasureSpec.makeMeasureSpec(Math.round(b[3]*scale),MeasureSpec.EXACTLY));if(child instanceof TextView&&scale!=lastStyled){TextView text=(TextView)child;text.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX,sizes[i]*scale);text.setPadding(i>=5&&i<=7?Math.round(24*scale):0,0,i>=5&&i<=7?Math.round(15*scale):0,0);if(i>=5&&i<=7){String value=text.getText().toString();int split=value.indexOf('\n');android.text.SpannableString styled=new android.text.SpannableString(value);styled.setSpan(new android.text.style.AbsoluteSizeSpan(Math.round(11*scale)),split+1,value.length(),0);styled.setSpan(new android.text.style.ForegroundColorSpan(activity.muted()),split+1,value.length(),0);text.setText(styled);}}}lastStyled=scale;
 }
 @Override protected void onLayout(boolean changed,int l,int t,int r,int b){for(int i=0;i<getChildCount();i++){float[] q=bounds[i];int x=Math.round(ox+q[0]*scale),y=Math.round(oy+q[1]*scale);getChildAt(i).layout(x,y,x+Math.round(q[2]*scale),y+Math.round(q[3]*scale));}}
 @Override protected void dispatchDraw(Canvas c){p.setColor(activity.store.dark?0x0ce2d5ed:0x70fffcec);c.drawCircle(getWidth()*.9f,getHeight()*.18f,74*scale,p);p.setColor(activity.store.dark?0x08c3caf0:0x50ffffff);c.drawOval(-110*scale,getHeight()*.3f,140*scale,getHeight()*.41f,p);p.setColor(0xffb9aed5);p.setTextSize(25*scale);c.drawText("✧",getWidth()*.1f,getHeight()*.88f,p);c.drawText("✦",getWidth()*.9f,getHeight()*.45f,p);super.dispatchDraw(c);}
 @Override public boolean canScrollVertically(int direction){return false;}
}
