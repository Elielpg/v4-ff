"""Receive real H264/AAC made from the socket-outage PCM regression on loopback."""
from pathlib import Path
import argparse,array,json,math,subprocess,socket,time

ROOT=Path(__file__).resolve().parents[1]
def run(command):return subprocess.run(list(map(str,command)),check=True,capture_output=True,text=True).stdout

def main():
    parser=argparse.ArgumentParser();parser.add_argument('work',type=Path);args=parser.parse_args()
    work=args.work.resolve();pcm=work/'pump-output.pcm';fixture=work/'outage-fixture.flv';output=work/'outage-received.flv'
    run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i','testsrc2=size=320x568:rate=15','-f','s16le','-ar','48000','-ac','2','-i',pcm,'-shortest','-c:v','libx264','-preset','ultrafast','-tune','zerolatency','-pix_fmt','yuv420p','-g','30','-bf','0','-c:a','aac','-ar','48000','-ac','2','-f','flv',fixture])
    with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
    with (work/'outage-receiver.log').open('w') as log:
        receiver=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','info','-y','-listen','1','-i',f'rtmp://127.0.0.1:{port}/live/test-local','-c','copy','-f','flv',str(output)],stdout=log,stderr=subprocess.STDOUT)
        try:
            time.sleep(.25)
            publisher=json.loads(run(['java','-cp',ROOT/'build/test-classes','PublishFlv',f'rtmp://127.0.0.1:{port}/live','test-local',fixture]))
            receiver.wait(timeout=8)
        finally:
            if receiver.poll() is None:receiver.terminate();receiver.wait(timeout=5)
    probe=json.loads(run(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',output]))
    video=next(s for s in probe['streams'] if s['codec_type']=='video');audio=next(s for s in probe['streams'] if s['codec_type']=='audio')
    assert video['codec_name']=='h264' and int(video['nb_read_frames'])>=49
    assert audio['codec_name']=='aac' and audio['channels']==2 and audio['sample_rate']=='48000'
    assert float(probe['format']['duration'])>=3.3
    packets=json.loads(run(['ffprobe','-v','error','-select_streams','v','-show_packets','-of','json',output]))['packets']
    times=[float(p['pts_time']) for p in packets];gap=max(b-a for a,b in zip(times,times[1:]))
    assert 0<gap<.075
    raw=subprocess.run(['ffmpeg','-v','error','-i',str(output),'-map','0:a:0','-f','s16le','-ar','48000','-ac','2','pipe:1'],check=True,capture_output=True).stdout
    samples=array.array('h');samples.frombytes(raw);rms=[]
    for at in range(0,len(samples)-1920,1920):rms.append(math.sqrt(sum(v*v for v in samples[at:at+1920])/1920)/32768)
    assert sum(v<.005 for v in rms)>=8 and sum(v>.05 for v in rms)>=100
    result={'ok':True,'scope':'Real loopback RTMP/FFmpeg H264/AAC reception, input PCM from forced socket EOF/timeout/recovery. No Android MediaCodec or Restream validation.',
            'video_frames':int(video['nb_read_frames']),'maximum_video_pts_gap_seconds':round(gap,4),'audio_sample_rate':48000,'audio_channels':2,
            'quiet_20ms_windows':sum(v<.005 for v in rms),'audible_20ms_windows':sum(v>.05 for v in rms),'publisher':publisher}
    (work/'outage-receiver-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))

if __name__=='__main__':main()
