package io.github.octopuskid.wordrain;

import android.graphics.*;

/** Dev7's soft, grid-free story sky. Input and simulation still use dev11 coordinates. */
final class StoryGameView extends GameView {
    final Typeface font;
    StoryGameView(MainActivity activity,GameEngine engine){super(activity,engine);font=Typeface.DEFAULT_BOLD;setContentDescription("Story playfield. Drag the basket to catch the glowing letter; avoid wrong letters and crosses.");}
    @Override void burst(){for(int i=0;i<12;i++)particles.add(new float[]{(float)engine.x*.75f,391,(float)(Math.random()-.5)*100,(float)(Math.random()-.5)*100,.5f});}
    @Override protected void onDraw(Canvas canvas){
        long now=System.nanoTime();double dt=last==0?0:Math.min(.04,(now-last)/1e9);last=now;engine.update(dt);
        // Keep the original 360×430 Dream composition. field also defines the inherited drag mapping.
        float scale=Math.min(getWidth()/360f,getHeight()/430f),w=360*scale,h=430*scale;field.set((getWidth()-w)/2,(getHeight()-h)/2,(getWidth()+w)/2,(getHeight()+h)/2);
        boolean dark=activity.store.dark;canvas.save();canvas.translate(field.left,field.top);canvas.scale(scale,scale);canvas.clipRect(0,0,360,430);
        p.setShader(new LinearGradient(0,0,0,430,dark?0xff29334d:0xfff9faff,dark?0xff222b43:0xffeef3ff,Shader.TileMode.CLAMP));canvas.drawRect(0,0,360,430,p);p.setShader(null);
        p.setColor(dark?0x77d9d2ed:0xccffffff);for(int i=0;i<9;i++)canvas.drawCircle((i*71+35)%360,(float)((i*53+engine.elapsed*5)%350),i%2==0?1:2,p);
        p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(1);p.setColor(dark?0xff4b5574:0xffd0d7ec);Path ground=new Path();ground.moveTo(25,410);ground.quadTo(180,430,335,410);canvas.drawPath(ground,p);p.setStyle(Paint.Style.FILL);
        for(GameEngine.Drop d:engine.drops){if(d.caught)continue;float x=(float)d.x*.75f,y=(float)d.y*430/530;boolean glow=d.kind==GameEngine.LETTER&&d.letter==engine.needed();
            if(glow){p.setShader(new RadialGradient(x,y,35,new int[]{dark?0x66e9d49d:0x88e9d49d,0x00d2bf89},null,Shader.TileMode.CLAMP));canvas.drawCircle(x,y,35,p);p.setShader(null);}
            p.setColor(d.kind==GameEngine.BOMB?0xffb7abc9:glow?0xfffff7d9:0xffe0e4f1);canvas.drawRoundRect(x-16,y-18,x+16,y+18,11,11,p);
            text(canvas,d.kind==GameEngine.BOMB?"×":String.valueOf(d.letter),x,y+7,21,d.kind==GameEngine.BOMB?0xff655375:0xff616c91,font);
        }
        float x=(float)engine.x*.75f;p.setColor(0xff9385b3);canvas.drawRoundRect(x-30,387,x+30,400,7,7,p);p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(4);Path basket=new Path();basket.moveTo(x-32,376);basket.quadTo(x-26,401,x,401);basket.quadTo(x+26,401,x+32,376);canvas.drawPath(basket,p);p.setStyle(Paint.Style.FILL);
        for(int i=particles.size()-1;i>=0;i--){float[] v=particles.get(i);if(engine.state==GameEngine.PLAYING){v[4]-=dt;v[0]+=v[2]*dt;v[1]+=v[3]*dt;}if(v[4]<=0){particles.remove(i);continue;}p.setColor(0xffb6a2d4);p.setAlpha((int)(Math.max(0,v[4])*510));canvas.drawCircle(v[0],v[1],2,p);}p.setAlpha(255);
        canvas.restore();activity.frame();if(engine.state==GameEngine.PLAYING)postInvalidateOnAnimation();
    }
}
