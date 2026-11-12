from pathlib import Path
import subprocess,os,hashlib,json,zipfile,secrets,sys,shutil
R=Path(__file__).resolve().parent;A=R/'app';B=R/'build';B.mkdir(exist_ok=True);tools=R/'sdk/android-15';jar=R/'sdk/android-35/android.jar';(R/'private').mkdir(exist_ok=True)
for name in ['aapt2','zipalign','d8','apksigner']:(tools/name).chmod(0o755)
def run(args):
 r=subprocess.run(list(map(str,args)),capture_output=True,text=True)
 if r.returncode:raise RuntimeError(r.stderr[-8000:])
 return r.stdout+r.stderr
run([tools/'aapt2','compile','--dir',A/'res','-o',B/'res.zip'])
run([tools/'aapt2','link','-o',B/'base.apk','--manifest',A/'AndroidManifest.xml','-I',jar,'--auto-add-overlay',B/'res.zip'])
shutil.rmtree(B/'classes',ignore_errors=True);(B/'classes').mkdir(exist_ok=True);sources=sorted((A/'src').rglob('*.java'))
run(['java','-m','jdk.compiler/com.sun.tools.javac.Main','-source','8','-target','8','-classpath',jar,'-d',B/'classes',*sources])
run(['java','-m','jdk.jartool/sun.tools.jar.Main','cf',B/'classes.jar','-C',B/'classes','.'])
shutil.rmtree(B/'dex',ignore_errors=True);(B/'dex').mkdir(exist_ok=True);run([tools/'d8','--min-api','29','--lib',jar,'--output',B/'dex',B/'classes.jar'])
with zipfile.ZipFile(B/'base.apk','a',zipfile.ZIP_DEFLATED) as z:z.write(B/'dex/classes.dex','classes.dex')
run([tools/'zipalign','-f','4',B/'base.apk',B/'aligned.apk'])
passwordFile=R/'private/signing-password';key=R/'private/batida-release.p12'
if not passwordFile.exists():passwordFile.write_text(secrets.token_hex(24));passwordFile.chmod(0o600)
password=passwordFile.read_text().strip();env=os.environ.copy();env['OMNI_APK_STOREPASS']=password
if not key.exists():
 r=subprocess.run(['keytool','-genkeypair','-keystore',str(key),'-alias','batida','-storepass:env','OMNI_APK_STOREPASS','-keypass:env','OMNI_APK_STOREPASS','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=Batida Omnitrix, OU=Local Audio, O=Clareira LIVE, C=BR'],env=env,capture_output=True,text=True)
 if r.returncode:raise RuntimeError(r.stderr)
output=Path(sys.argv[sys.argv.index('--output')+1]).resolve() if '--output' in sys.argv else (R.parent/'game/public/downloads/BATIDA_OMNITRIX_V48.apk' if (R.parent/'game').exists() else R/'output/BATIDA_OMNITRIX_V48.apk');output.parent.mkdir(parents=True,exist_ok=True)
r=subprocess.run([str(tools/'apksigner'),'sign','--ks',str(key),'--ks-key-alias','batida','--ks-pass','env:OMNI_APK_STOREPASS','--key-pass','env:OMNI_APK_STOREPASS','--out',str(output),str(B/'aligned.apk')],env=env,capture_output=True,text=True)
if r.returncode:raise RuntimeError(r.stderr)
verified=run([tools/'apksigner','verify','--verbose','--print-certs',output]);badging=run([tools/'aapt2','dump','badging',output]);assert "minSdkVersion:'29'" in badging and "targetSdkVersion:'35'" in badging
assert 'android.permission.RECORD_AUDIO' in badging and 'android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION' in badging
result={'file':output.name,'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'signatureVerification':verified,'manifest':badging,'testsScope':'Compilação, manifesto e assinatura; captura real depende de teste no Android.'}
(R/'build/android-build.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps({'apk':output.name,'bytes':result['bytes'],'sha256':result['sha256'],'signature':'verified'}))
