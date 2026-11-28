package br.cofra.studio;

/** Session-only status. Cleanup and late progress must never erase a failure. */
public final class CaptureState {
 private String mode="idle",stage="idle",message="Pronto para um teste local.",error="";
 private boolean failed;
 public synchronized void begin(String mode){this.mode=mode;stage="authorizing";message="Preparando captura…";error="";failed=false;}
 public synchronized void progress(String stage,String message){if(failed)return;this.stage=stage;this.message=message;}
 public synchronized void fail(String code,String message){if(failed)return;failed=true;error=code;this.message=message;}
 public synchronized void finish(String message){if(failed)return;stage="stopped";this.message=message;}
 public synchronized String message(){return message;}
 public synchronized String stage(){return stage;}
 public synchronized boolean failed(){return failed;}
 public synchronized String diagnostic(){return "mode="+mode+"\nstage="+stage+"\nfailed="+failed+"\nerror="+error;}
}
