package io.github.octopuskid.wordrain;

import java.io.File;
import java.nio.file.Files;
import java.nio.charset.StandardCharsets;
import java.util.*;

/** Read-only Chromium LocalStorage migration. Never opens a browser or modifies its files. */
public final class LegacyStore {
    private static final int LIMIT=32*1024*1024;
    private static final class Saved {long sequence;byte[] value;Saved(long s,byte[] v){sequence=s;value=v;}}
    private final Map<String,Saved> entries=new HashMap<String,Saved>();
    private static long little(byte[] b,int p,int n){long v=0;for(int i=0;i<n;i++)v|=(b[p+i]&255L)<<(8*i);return v;}
    private static long var(byte[] b,int[] p){long v=0;for(int s=0;s<64;s+=7){if(p[0]>=b.length)throw new IllegalArgumentException();int x=b[p[0]++]&255;v|=(long)(x&127)<<s;if(x<128)return v;}throw new IllegalArgumentException();}
    private static byte[] field(byte[] b,int[] p){int n=(int)var(b,p);if(n<0||n>LIMIT||p[0]+n>b.length)throw new IllegalArgumentException();byte[] out=Arrays.copyOfRange(b,p[0],p[0]+n);p[0]+=n;return out;}
    private void put(byte[] key,long sequence,byte[] value){String k=Base64.getEncoder().encodeToString(key);Saved previous=entries.get(k);if(previous==null||sequence>=previous.sequence)entries.put(k,new Saved(sequence,value));}
    private void batch(byte[] bytes){if(bytes.length<12)return;long sequence=little(bytes,0,8);int count=(int)little(bytes,8,4),p[]=new int[]{12};if(count<0||count>100000)return;
        for(int i=0;i<count;i++){int kind=bytes[p[0]++]&255;byte[] key=field(bytes,p);byte[] value=kind==1?field(bytes,p):null;if(kind>1)throw new IllegalArgumentException();put(key,sequence+i,value);}}
    private void log(byte[] data){java.io.ByteArrayOutputStream parts=new java.io.ByteArrayOutputStream();for(int block=0;block<data.length;block+=32768){int end=Math.min(data.length,block+32768);for(int p=block;p+7<=end;){int len=(int)little(data,p+4,2),type=data[p+6]&255;p+=7;if(len==0&&type==0)break;if(p+len>end)break;byte[] chunk=Arrays.copyOfRange(data,p,p+len);p+=len;if(type==1){batch(chunk);parts.reset();}else if(type==2){parts.reset();parts.write(chunk,0,chunk.length);}else if(type==3)parts.write(chunk,0,chunk.length);else if(type==4){parts.write(chunk,0,chunk.length);batch(parts.toByteArray());parts.reset();}}}}
    public static byte[] snappy(byte[] in){int[] p={0};int n=(int)var(in,p);if(n<0||n>LIMIT)throw new IllegalArgumentException();byte[] out=new byte[n];int at=0;
        while(p[0]<in.length&&at<n){int tag=in[p[0]++]&255,type=tag&3,len,offset;
            if(type==0){int x=tag>>>2;if(x<60)len=x+1;else{int bytes=x-59;if(bytes>4||p[0]+bytes>in.length)throw new IllegalArgumentException();len=(int)little(in,p[0],bytes)+1;p[0]+=bytes;}if(len<0||at+len>n||p[0]+len>in.length)throw new IllegalArgumentException();System.arraycopy(in,p[0],out,at,len);p[0]+=len;at+=len;continue;}
            if(type==1){len=4+((tag>>>2)&7);offset=((tag&224)<<3)|(in[p[0]++]&255);}else if(type==2){len=1+(tag>>>2);offset=(int)little(in,p[0],2);p[0]+=2;}else{len=1+(tag>>>2);offset=(int)little(in,p[0],4);p[0]+=4;}
            if(offset<=0||offset>at||at+len>n)throw new IllegalArgumentException();for(int i=0;i<len;i++){out[at]=out[at-offset];at++;}
        }if(at!=n)throw new IllegalArgumentException();return out;
    }
    private static byte[] block(byte[] table,byte[] handle){int[] p={0};int at=(int)var(handle,p),n=(int)var(handle,p);if(at<0||n<0||n>LIMIT||at+n+5>table.length)throw new IllegalArgumentException();byte[] data=Arrays.copyOfRange(table,at,at+n);int compression=table[at+n]&255;if(compression==0)return data;if(compression==1)return snappy(data);throw new IllegalArgumentException();}
    private interface Visitor {void item(byte[] key,byte[] value);}
    private static void visit(byte[] data,Visitor visitor){if(data.length<4)return;int restarts=(int)little(data,data.length-4,4),end=data.length-4-4*restarts;if(end<0)throw new IllegalArgumentException();int[] p={0};byte[] previous=new byte[0];while(p[0]<end){int shared=(int)var(data,p),extra=(int)var(data,p),size=(int)var(data,p);if(shared<0||shared>previous.length||extra<0||size<0||p[0]+extra+size>end)throw new IllegalArgumentException();byte[] key=Arrays.copyOf(previous,shared+extra);System.arraycopy(data,p[0],key,shared,extra);p[0]+=extra;byte[] value=Arrays.copyOfRange(data,p[0],p[0]+size);p[0]+=size;visitor.item(key,value);previous=key;}}
    private void table(final byte[] data){if(data.length<48||little(data,data.length-8,8)!=0xdb4775248b80fb57L)return;int[] p={data.length-48};var(data,p);var(data,p);int start=p[0];var(data,p);var(data,p);byte[] index=block(data,Arrays.copyOfRange(data,start,p[0]));visit(index,new Visitor(){public void item(byte[] key,byte[] value){visit(block(data,value),new Visitor(){public void item(byte[] internal,byte[] v){if(internal.length<8)return;long suffix=little(internal,internal.length-8,8);put(Arrays.copyOf(internal,internal.length-8),suffix>>>8,(suffix&255)==0?null:v);}});}});}
    private static String decode(byte[] data,int from){if(from>=data.length)return "";int encoding=data[from]&255;return new String(data,from+1,data.length-from-1,encoding==0?StandardCharsets.UTF_16LE:StandardCharsets.ISO_8859_1);}
    public static Map<String,String> read(File directory){LegacyStore reader=new LegacyStore();File[] files=directory.listFiles();if(files==null)return new HashMap<String,String>();for(File file:files){if(file.length()>LIMIT)continue;String name=file.getName();try{if(name.endsWith(".log"))reader.log(Files.readAllBytes(file.toPath()));else if(name.endsWith(".ldb")||name.endsWith(".sst"))reader.table(Files.readAllBytes(file.toPath()));}catch(Exception incomplete){/* Retain original files; unreadable records are never rewritten. */}}
        Map<String,String> result=new HashMap<String,String>();for(Map.Entry<String,Saved> e:reader.entries.entrySet()){byte[] key=Base64.getDecoder().decode(e.getKey()),value=e.getValue().value;if(value==null||key.length==0||key[0]!='_')continue;int zero=-1;for(int i=1;i<key.length;i++)if(key[i]==0){zero=i;break;}if(zero<0)continue;String origin=new String(key,1,zero-1,StandardCharsets.UTF_8);if(!origin.equals("https://appassets.androidplatform.net"))continue;String name=decode(key,zero+1);if(name.startsWith("word-rain-"))result.put(name,decode(value,0));}return result;}
}
