"""RTMP interoperability against a local peer; no real LIVE/destination/credentials."""
from pathlib import Path
import argparse,json,socket,struct,subprocess,threading,time

ROOT=Path(__file__).resolve().parents[1]

def exact(sock,n):
    data=b''
    while len(data)<n:
        part=sock.recv(n-len(data))
        if not part:raise EOFError()
        data+=part
    return data

def amf(value):
    if value is None:return b'\x05'
    if isinstance(value,str):
        data=value.encode();return b'\x02'+struct.pack('>H',len(data))+data
    if isinstance(value,(int,float)):return b'\x00'+struct.pack('>d',value)
    if isinstance(value,dict):
        return b'\x03'+b''.join(struct.pack('>H',len(k.encode()))+k.encode()+amf(v) for k,v in value.items())+b'\x00\x00\x09'
    raise ValueError('Unsupported fixture value')

class Peer:
    def __init__(self,sock):self.sock=sock;self.chunk=128;self.channels={};self.video=0
    def send(self,*values):
        data=b''.join(amf(v) for v in values)
        # AMF0, stream 1. Avoid sharing the production chunk implementation.
        self.sock.sendall(b'\x03'+b'\x00\x00\x00'+len(data).to_bytes(3,'big')+b'\x14'+struct.pack('<I',1)+data[:128]+b''.join(b'\xc3'+data[p:p+128] for p in range(128,len(data),128)))
    def message(self):
        while True:
            basic=exact(self.sock,1)[0];fmt=basic>>6;channel=basic&63
            if fmt==0:
                header=exact(self.sock,11);size=int.from_bytes(header[3:6],'big');kind=header[6]
                self.channels[channel]=[size,kind,bytearray()]
            elif fmt!=3:raise AssertionError('Unexpected fixture client format')
            size,kind,data=self.channels[channel]
            data.extend(exact(self.sock,min(self.chunk,size-len(data))))
            if len(data)==size:
                if kind==1:self.chunk=int.from_bytes(data,'big')
                if kind==9:self.video+=1
                return kind,bytes(data)
    def command_name(self,data):
        assert data[0]==2
        size=int.from_bytes(data[1:3],'big');return data[3:3+size].decode()

def scenario(classes,mode):
    server=socket.socket();server.bind(('127.0.0.1',0));server.listen(1);server.settimeout(10)
    port=server.getsockname()[1];result={'case':mode,'c2_before_s2':False,'video_received':0};errors=[];finished=threading.Event()
    def serve():
        try:
            with server.accept()[0] as sock:
                sock.settimeout(2)
                hello=exact(sock,1537);assert hello[0]==3
                s1=bytes(range(256))*6;sock.sendall(b'\x03'+s1)
                # Legal RTMP ordering that the old publisher deadlocks on.
                assert exact(sock,1536)==s1;result['c2_before_s2']=True
                sock.sendall(hello[1:]);peer=Peer(sock)
                while True:
                    kind,data=peer.message()
                    if kind!=20:continue
                    name=peer.command_name(data)
                    if name=='connect':peer.send('_result',1,None,{'code':'NetConnection.Connect.Success'})
                    elif name=='createStream':peer.send('_result',4,None,1)
                    elif name=='publish':
                        peer.send('onStatus',0,None,{'code':'NetStream.Publish.BadName' if mode=='reject' else 'NetStream.Publish.Start'})
                        break
                if mode=='reject':return
                if mode=='stall':finished.wait(23);return
                while peer.video<1:peer.message()
                result['video_received']=peer.video
                if mode=='post-reject':peer.send('onStatus',0,None,{'code':'NetStream.Failed','description':'fixture-key must never reach logs'})
                if mode=='disconnect':return
                # Keep the socket alive long enough for the publisher to report.
                while sock.recv(4096):pass
        except Exception as exc:errors.append(type(exc).__name__)
        finally:server.close()
    worker=threading.Thread(target=serve);worker.start()
    started=time.monotonic()
    process=subprocess.run(['java','-cp',str(classes),'ConnectionProbe',f'rtmp://127.0.0.1:{port}/live',mode],capture_output=True,text=True,timeout=25)
    finished.set()
    worker.join(timeout=3)
    assert not worker.is_alive()
    result.update(publisher=json.loads(process.stdout),peer_errors=errors,elapsed_seconds=round(time.monotonic()-started,3))
    result['passed']=process.returncode==0 and not errors and result['c2_before_s2'] and (mode in ('reject','stall') or result['video_received']>0)
    return result

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--classes',type=Path,default=ROOT/'build/test-classes');parser.add_argument('--case',choices=('accept','reject','post-reject','disconnect','stall'));parser.add_argument('--output',type=Path);args=parser.parse_args()
    cases=[args.case] if args.case else ['accept','reject','post-reject','disconnect','stall']
    results=[scenario(args.classes,mode) for mode in cases]
    text=json.dumps({'scope':'Synthetic loopback RTMP peer. No Restream/TikTok or Android validation.','results':results},indent=2)
    if args.output:args.output.write_text(text+'\n')
    print(text)
    raise SystemExit(0 if all(r['passed'] for r in results) else 1)
