package br.cofra.studio;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

/** PCM from the game's existing mixer; never receives the TikTok stream key. */
final class GamePcm implements AutoCloseable {
  private HttpURLConnection stream;
  private InputStream input;
  void open() throws Exception {
    HttpURLConnection auth=(HttpURLConnection)new URL("http://127.0.0.1:9393/termux/studio/audio/authorize").openConnection();
    auth.setConnectTimeout(2500);auth.setReadTimeout(2500);auth.setInstanceFollowRedirects(false);auth.setRequestMethod("POST");auth.setDoOutput(true);auth.setRequestProperty("Content-Type","application/json");
    String token;
    try {
      auth.getOutputStream().write("{}".getBytes(StandardCharsets.UTF_8));
      if(auth.getResponseCode()!=200)throw new IOException("Atualize o complemento Termux e abra o jogo com som antes do teste.");
      ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] block=new byte[1024];int n;
      try(InputStream source=auth.getInputStream()){while((n=source.read(block))>0){if(out.size()+n>8192)throw new IOException();out.write(block,0,n);}}
      JSONObject data=new JSONObject(new String(out.toByteArray(),StandardCharsets.UTF_8));token=data.getString("token");
      if(!token.matches("[0-9a-f]{64}")||data.getInt("sample_rate")!=48000||data.getInt("channels")!=2)throw new IOException();
    } finally {auth.disconnect();}
    stream=(HttpURLConnection)new URL("http://127.0.0.1:9393/termux/studio/audio/pcm").openConnection();
    stream.setConnectTimeout(2500);stream.setReadTimeout(5000);stream.setInstanceFollowRedirects(false);stream.setRequestProperty("Authorization","Bearer "+token);
    if(stream.getResponseCode()!=200)throw new IOException("A ponte de áudio não abriu. Confira se o jogo tem som no painel.");input=stream.getInputStream();
  }
  int read(byte[] target,int length)throws IOException {
    int at=0;while(at<length){int n=input.read(target,at,length-at);if(n<0)throw new EOFException();at+=n;}return at;
  }
  public void close(){try{if(input!=null)input.close();}catch(IOException ignored){}if(stream!=null)stream.disconnect();}
}
