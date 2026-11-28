"""Reproducible JVM/socket/media checks; loopback only, no account or LIVE."""
from pathlib import Path
import argparse,json,subprocess

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=root/'build/verification');args=parser.parse_args()
work=args.output.resolve();work.mkdir(parents=True,exist_ok=True)
classes=root/'build/test-classes';classes.mkdir(parents=True,exist_ok=True)
sources=list((root/'app/src/br/cofra/studio/rtmp').glob('*.java'))
sources += [root/'app/src/br/cofra/studio'/name for name in ('FrameMath.java','PcmRing.java','PcmPump.java','CaptureState.java')]
sources += list((root/'tests').glob('*.java'))
commands=[['java','-m','jdk.compiler/com.sun.tools.javac.Main','-d',classes,*sources],
          ['java','-cp',classes,'ProtocolTest'],
          ['java','-cp',classes,'PcmPumpTest',work],
          ['python3',root/'tests/run_connections.py','--output',work/'connection-tests.json'],
          ['python3',root/'tests/run_receiver.py'],
          ['python3',root/'tests/run_audio_outage_receiver.py',work]]
report=[]
for index,command in enumerate(commands):
    with (work/f'check-{index}.log').open('w') as log:
        process=subprocess.run(list(map(str,command)),cwd=root,stdout=log,stderr=subprocess.STDOUT,timeout=65)
    if process.returncode:raise SystemExit((work/f'check-{index}.log').read_text())
    report.append({'check':index,'exit_code':process.returncode})
(work/'checks.json').write_text(json.dumps({'ok':True,'scope':'JVM and loopback only; not Android/Restream','commands':report},indent=2)+'\n')
print(json.dumps({'ok':True,'checks':len(report),'output':str(work)}))
