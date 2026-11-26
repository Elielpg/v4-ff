"""JVM RTMP publisher to an FFmpeg loopback receiver. Never uses a real service/key."""
from pathlib import Path
import subprocess,time,json,hashlib,os
root=Path(__file__).resolve().parents[1];r=root/'build/receiver';r.mkdir(parents=True,exist_ok=True)
def run(cmd):return subprocess.run(list(map(str,cmd)),check=True,capture_output=True,text=True).stdout
fixture=r/'fixture.flv'
run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i','testsrc2=size=320x568:rate=15','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','3','-c:v','libx264','-preset','ultrafast','-tune','zerolatency','-pix_fmt','yuv420p','-g','30','-bf','0','-c:a','aac','-ar','48000','-ac','2','-f','flv',fixture])
output=r/'received.flv';log=(r/'receiver.log').open('w');receiver=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','info','-y','-listen','1','-i','rtmp://127.0.0.1:19436/live/test-local','-c','copy','-f','flv',str(output)],stdout=log,stderr=subprocess.STDOUT)
try:
 time.sleep(.3);publisher=run(['java','-cp',root/'build/test-classes','PublishFlv','rtmp://127.0.0.1:19436/live','test-local',fixture])
 receiver.wait(timeout=8)
 probe=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',output]));streams=probe['streams'];v=next(s for s in streams if s['codec_type']=='video');a=next(s for s in streams if s['codec_type']=='audio');assert v['codec_name']=='h264' and v['width']==320 and v['height']==568;assert a['sample_rate']=='48000' and a['channels']==2;assert float(probe['format']['duration'])>=2.9
 result={'ok':True,'scope':'Local Java protocol/FFmpeg receive test; no Android MediaProjection/MediaCodec validation','publisher':json.loads(publisher),'video':{k:v[k] for k in ('codec_name','width','height')},'audio':{k:a[k] for k in ('codec_name','sample_rate','channels')},'duration':probe['format']['duration'],'sha256':hashlib.sha256(output.read_bytes()).hexdigest()};(r/'result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
finally:
 if receiver.poll() is None:receiver.terminate();receiver.wait(timeout=5)
 log.close()
