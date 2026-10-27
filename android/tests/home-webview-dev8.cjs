const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const ecj=process.argv[2];if(!ecj)throw Error('Pass the ECJ jar path');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wr-home-scroll-'));
try{
const files={
 'android/content/Context.java':'package android.content; public class Context {}',
 'android/webkit/WebView.java':`package android.webkit;
import android.content.Context;
public class WebView {
 public static final int OVER_SCROLL_NEVER=2,OVER_SCROLL_IF_CONTENT_SCROLLS=1;
 public int x,y,flings,computes,mode,scrollCalls;public boolean animating=true;public boolean vertical,horizontal;
 public WebView(Context c){}
 public void setVerticalScrollBarEnabled(boolean v){vertical=v;}
 public void setHorizontalScrollBarEnabled(boolean v){horizontal=v;}
 public void setOverScrollMode(int v){mode=v;}
 public void scrollTo(int a,int b){scrollCalls++;x=a;y=b;}
 public int getScrollX(){return x;}public int getScrollY(){return y;}
 protected boolean overScrollBy(int dx,int dy,int a,int b,int rx,int ry,int mx,int my,boolean touch){x=a+dx;y=b+dy;return true;}
 protected void onOverScrolled(int a,int b,boolean cx,boolean cy){x=a;y=b;}
 public void flingScroll(int vx,int vy){flings++;x+=vx;y+=vy;}
 public void computeScroll(){computes++;if(animating)y+=100;}
}`,
 'io/github/octopuskid/wordrain/HomeWebViewTest.java':`package io.github.octopuskid.wordrain;
import android.content.Context;
public class HomeWebViewTest {
 static void check(boolean good){if(!good)throw new AssertionError();}
 public static void main(String[] args){
  HomeWebView v=new HomeWebView(new Context());
  check(!v.vertical&&!v.horizontal&&v.mode==2);
  v.scrollTo(30,400);check(v.x==0&&v.y==0);
  check(!v.overScrollBy(20,50,0,0,100,200,10,10,true));check(v.x==0&&v.y==0);
  v.onOverScrolled(40,100,true,true);check(v.x==0&&v.y==0);
  v.flingScroll(0,600);v.computeScroll();check(v.flings==0&&v.computes==1&&v.y==0);
  v.setHomeScrollLocked(false);check(v.vertical&&v.horizontal&&v.mode==1);
  v.scrollTo(20,80);check(v.x==20&&v.y==80);
  check(v.overScrollBy(0,30,20,80,100,200,10,10,true));check(v.y==110);
  v.onOverScrolled(0,120,false,false);check(v.y==120);
  v.flingScroll(0,25);v.computeScroll();check(v.flings==1&&v.computes==2&&v.y==245);
  v.setHomeScrollLocked(true);check(v.x==0&&v.y==0&&!v.vertical);
  v.computeScroll();v.flingScroll(0,900);check(v.y==0&&v.flings==1&&v.computes==3);
  v.animating=false;int before=v.scrollCalls;v.computeScroll();v.computeScroll();
  check(v.computes==5&&v.scrollCalls==before); // Idle frames must not reset input via scrollTo.
  System.out.println("PASS dev9 native guard: direct scroll, overscroll, fling, animation/frame processing, no idle scroll resets, offsets, scrollbars and unlocked delegation (Android API doubles).");
 }
}`};
const sources=[];for(const [name,body] of Object.entries(files)){const dest=path.join(temp,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,body);sources.push(dest);}
sources.push(path.join(__dirname,'../src/io/github/octopuskid/wordrain/HomeWebView.java'));
const out=path.join(temp,'classes');cp.execFileSync('java',['-jar',path.resolve(ecj),'-17','-d',out,...sources],{stdio:'inherit'});
cp.execFileSync('java',['-cp',out,'io.github.octopuskid.wordrain.HomeWebViewTest'],{stdio:'inherit'});
}finally{fs.rmSync(temp,{recursive:true,force:true});}
