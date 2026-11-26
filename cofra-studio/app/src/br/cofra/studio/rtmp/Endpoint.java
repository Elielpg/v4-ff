package br.cofra.studio.rtmp;
import java.net.URI;
public final class Endpoint {
 public final String host,app,stream,tcUrl;public final int port;public final boolean tls;
 public Endpoint(String url,String key){try{URI u=new URI(url.trim());tls="rtmps".equalsIgnoreCase(u.getScheme());if(!tls&&!"rtmp".equalsIgnoreCase(u.getScheme()))throw new IllegalArgumentException();host=u.getHost();port=u.getPort()<0?(tls?443:1935):u.getPort();if(host==null||host.isEmpty()||u.getUserInfo()!=null||u.getFragment()!=null||u.getQuery()!=null||port<1||port>65535)throw new IllegalArgumentException();String p=u.getRawPath()==null?"":u.getRawPath().replaceAll("^/+|/+$","");app=p.isEmpty()?"live":p;stream=key.trim();if(stream.isEmpty()||stream.length()>2048||app.length()>1024||stream.matches("(?s).*[\\x00-\\x20\\x7f].*")||stream.contains("#"))throw new IllegalArgumentException();tcUrl=(tls?"rtmps":"rtmp")+"://"+(host.contains(":")?"["+host+"]":host)+(u.getPort()<0?"":":"+port)+"/"+app;}catch(Exception e){throw new IllegalArgumentException("Use servidor rtmp:// ou rtmps:// e chave separada, sem espaços.");}}
 @Override public String toString(){return "Destino RTMP configurado";}
}
