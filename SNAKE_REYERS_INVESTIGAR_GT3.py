#!/usr/bin/env python3
"""Read-only, bounded investigation of a running Snake Reyers/Termux game.

No package installation, APK change, process signalling, OS setting or network
request beyond the loopback panel. Never includes raw command lines or environ.
"""
from __future__ import annotations
import argparse
import datetime
import json
import os
import re
import shutil
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

VERSION='1.0'
MAX_READ=65536
FLAGS={'--rendering-method','--rendering-driver','--display-driver','--audio-driver','--max-fps','--resolution','--render-thread','--fixed-fps','--frame-delay'}
SWITCHES={'--disable-vsync','--gpu-profile','--headless','--windowed','--fullscreen'}
GAME_NAMES={'snakereyers.exe','snakereyers.x86_64'}
GPU_KEYS=('gpu_model','gpubusy','gpuclk','max_gpuclk','min_pwrlevel','max_pwrlevel','thermal_pwrlevel','default_pwrlevel','num_pwrlevels','devfreq/cur_freq','devfreq/min_freq','devfreq/max_freq','devfreq/available_frequencies','devfreq/governor')
STATUS_KEYS={'Name','State','Uid','Threads','Cpus_allowed_list','voluntary_ctxt_switches','nonvoluntary_ctxt_switches'}
CGROUP_KEYS=('cpu.shares','cpu.weight','cpu.max','cpu.cfs_quota_us','cpu.cfs_period_us','cpu.uclamp.min','cpu.uclamp.max','cpuset.cpus.effective','cpuset.cpus')


def read(path,maximum=MAX_READ):
    try:
        with Path(path).open('r',errors='replace') as stream:return stream.read(maximum).strip()
    except (OSError,ValueError):return None


def number(path):
    value=read(path,128)
    try:return int(value) if value is not None else None
    except ValueError:return None


def command(args,timeout=2):
    if not shutil.which(args[0]):return None
    try:
        result=subprocess.run(args,stdin=subprocess.DEVNULL,capture_output=True,text=True,timeout=timeout)
        return result.stdout[:65536] if result.returncode==0 else None
    except (OSError,subprocess.TimeoutExpired):return None


def selected_flags(args):
    result={}
    for i,value in enumerate(args):
        if value=='--':break
        if value in SWITCHES:result[value]=True
        elif value in FLAGS and i+1<len(args):
            candidate=args[i+1]
            if re.fullmatch(r'[A-Za-z0-9_.+x-]{1,64}',candidate):result[value]=candidate
    return result


def process_args(pid,proc=Path('/proc')):
    try:return (proc/str(pid)/'cmdline').read_bytes()[:16384].decode(errors='replace').split('\0')
    except OSError:return []


def game_pids(proc=Path('/proc')):
    result=[]
    for root in sorted(proc.glob('[0-9]*'))[:2048]:
        try:
            if root.stat().st_uid!=os.getuid():continue
            args=process_args(int(root.name),proc)
            if '--main-pack' not in args:continue
            i=args.index('--main-pack')
            if i+1<len(args) and Path(args[i+1]).name.lower() in GAME_NAMES:result.append(int(root.name))
        except (OSError,ValueError):pass
    return result[:8]


def stat_file(path):
    value=read(path)
    if not value:return None
    try:
        end=value.rindex(')');fields=value[end+2:].split()
        return {'tid':int(value[:value.index('(')].strip()),'name':value[value.index('(')+1:end][:60],
                'state':fields[0],'ppid':int(fields[1]),'ticks':int(fields[11])+int(fields[12]),
                'start_ticks':int(fields[19]),'last_cpu':int(fields[36]),'nice':int(fields[16])}
    except (ValueError,IndexError):return None


def status(path):
    value=read(path)
    if value is None:return None
    return {line.split(':',1)[0]:line.split(':',1)[1].strip() for line in value.splitlines() if ':' in line and line.split(':',1)[0] in STATUS_KEYS}


def cgroup_controls(text,roots):
    controls=[]
    for line in (text or '').splitlines():
        parts=line.split(':',2)
        if len(parts)!=3:continue
        relative=parts[2].lstrip('/')
        if '..' in Path(relative).parts:continue
        for base in roots:
            target=Path(base)/relative
            values={key:read(target/key,256) for key in CGROUP_KEYS}
            values={k:v for k,v in values.items() if v is not None}
            if values:controls.append({'hierarchy':str(base),'group':parts[2],'controls':values})
    return controls[:12]


def api(path):
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self,*args,**kwargs):return None
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect())
    try:
        with opener.open('http://127.0.0.1:9393'+path,timeout=2) as response:
            raw=response.read(524289)
            if len(raw)>524288:return None
            obj=json.loads(raw)
            return obj if isinstance(obj,dict) else None
    except (OSError,ValueError,urllib.error.URLError):return None


def render_state(raw):
    if not isinstance(raw,dict):return {'available':False}
    graphics=raw.get('device',{}).get('graphics',{})
    perf=raw.get('performance',{});audio=raw.get('audio_runtime',{})
    return {'available':True,'running':raw.get('running'),'pid':raw.get('pid'),'started_at':raw.get('started_at'),
            'renderer_selected':raw.get('renderer'),'renderer_observed':perf.get('observed_renderer'),
            'project_fps':perf.get('fps'),'software_renderer':perf.get('software_renderer'),
            'graphics':{key:graphics.get(key) for key in ('profile','resolution','max_fps','hardware_verified')},
            'audio':{'state':audio.get('state'),'driver':audio.get('driver')},
            'fps_scope':'Godot process-frame counter from log; not independent display-presentation timing.'}


def package_uids(text):
    values={}
    for name,uid in re.findall(r'^package:(com\.termux(?:\.x11)?)\s+uid:(\d+)\s*$',text or '',re.M):values[name]=int(uid)
    return values


def environment():
    props={}
    for name in ('ro.build.version.release','ro.build.version.sdk','ro.soc.model','ro.soc.manufacturer','ro.hardware'):
        value=command(['getprop',name],timeout=1)
        props[name]=value.strip() if value else None
    pkgs=package_uids(command(['cmd','package','list','packages','-U','com.termux']) or '')
    x11=pkgs.get('com.termux.x11');termux=pkgs.get('com.termux',os.getuid())
    return {'collector_version':VERSION,'android':props,'termux_apk_release':os.environ.get('TERMUX_APK_RELEASE'),
            'termux_version':os.environ.get('TERMUX_VERSION'),'collector_uid':os.getuid(),'package_uids':pkgs,
            'x11_shares_termux_uid':x11==termux if x11 is not None else None,
            'same_uid_note':'Same UID alone does not prove foreground scheduling or signature compatibility for an APK replacement.',
            'termux_x11_package_version':(command(['dpkg-query','-W','-f=${Version}','termux-x11-nightly']) or '').strip() or None,
            'gpu_driver_package_version':(command(['dpkg-query','-W','-f=${Version}','mesa-vulkan-icd-freedreno']) or '').strip() or None}


def system(sysroot=Path('/sys'),proc=Path('/proc')):
    cpu=[]
    for policy in sorted((sysroot/'devices/system/cpu/cpufreq').glob('policy*'))[:16]:
        values={key:read(policy/key,512) for key in ('affected_cpus','related_cpus','scaling_cur_freq','scaling_min_freq','scaling_max_freq','cpuinfo_max_freq','cpuinfo_min_freq','scaling_governor')}
        cpu.append({'policy':policy.name,**values})
    gpu=sysroot/'class/kgsl/kgsl-3d0'
    gpu_values={key:read(gpu/key,512) for key in GPU_KEYS}
    temp=[]
    for zone in sorted((sysroot/'class/thermal').glob('thermal_zone*'))[:128]:
        kind=read(zone/'type',128)
        if not kind or not any(key in kind.lower() for key in ('cpu','gpu','soc','skin','battery','quiet','xo')):continue
        raw=number(zone/'temp')
        temp.append({'zone':zone.name,'sensor':kind,'raw':raw,'celsius_from_linux_millidegree_abi':raw/1000 if raw is not None else None,
                     'unit_warning':'Raw magnitude under 1000: vendor/virtual sensor scale may differ; do not treat this as a calibrated Celsius reading.' if raw is not None and abs(raw)<1000 else None})
    cooling=[]
    for dev in sorted((sysroot/'class/thermal').glob('cooling_device*'))[:128]:
        kind=read(dev/'type',128)
        if not kind or not any(k in kind.lower() for k in ('cpu','gpu','freq','thermal','soc','core','charger')):continue
        cooling.append({'device':dev.name,'type':kind,'cur_state':number(dev/'cur_state'),'max_state':number(dev/'max_state')})
    mem={}
    for line in (read(proc/'meminfo') or '').splitlines():
        if ':' in line and line.split(':')[0] in ('MemAvailable','MemTotal','SwapFree','SwapTotal'):
            value=line.split(':',1)[1].strip().split()
            if value and value[0].isdigit():mem[line.split(':')[0]+'_kb']=int(value[0])
    pressure={k:read(proc/'pressure'/k,2048) for k in ('cpu','memory','io')}
    return {'cpu_online':read(sysroot/'devices/system/cpu/online',128),'cpu_freq_khz':cpu,'gpu_raw':gpu_values,
            'gpu_units':'devfreq values are Hz; gpuclk/max_gpuclk follow the vendor driver; preserve raw values.',
            'thermal':temp,'cooling':cooling,'memory':mem,'pressure':pressure,
            'frequency_note':'Reported frequencies/policy caps are observations, not proof of thermal throttling; unavailable files remain null.'}


class Probe:
    def __init__(self,proc=Path('/proc'),sysroot=Path('/sys'),cgroups=None):
        self.proc,self.sysroot=Path(proc),Path(sysroot)
        self.hz=os.sysconf('SC_CLK_TCK');self.previous={}
        self.cgroups=cgroups if cgroups is not None else [Path('/dev/cpuctl'),Path('/dev/cpuset'),Path('/sys/fs/cgroup')]

    def process(self,pid,now):
        root=self.proc/str(pid)
        try:
            if root.stat().st_uid!=os.getuid():return None
        except OSError:return None
        info=stat_file(root/'stat')
        if info is None:return None
        group=read(root/'cgroup',4096);rows=[]
        for path in sorted((root/'task').glob('[0-9]*/stat'))[:128]:
            value=stat_file(path)
            if value is None:continue
            tid=value['tid'];task=path.parent;before=self.previous.get((pid,tid));duration=now-before['at'] if before else 0
            cpu=None;wait_pct=None;run_pct=None
            sched=read(task/'schedstat',256)
            try:ss=[int(x) for x in sched.split()[:3]] if sched else None
            except ValueError:ss=None
            if ss and len(ss)<2:ss=None
            if before and before['start']==value['start_ticks'] and duration>.1:
                cpu=round(max(0,value['ticks']-before['ticks'])/self.hz/duration*100,2)
                old=before.get('sched')
                if ss and old and ss[1]>=old[1] and ss[0]>=old[0]:
                    run_pct=round((ss[0]-old[0])/1e9/duration*100,2);wait_pct=round((ss[1]-old[1])/1e9/duration*100,2)
            self.previous[(pid,tid)]={'at':now,'start':value['start_ticks'],'ticks':value['ticks'],'sched':ss}
            attrs={}
            for line in (read(task/'sched',8192) or '').splitlines():
                if ':' not in line:continue
                key,val=line.split(':',1);key=key.strip()
                if key in ('policy','prio','uclamp.min','uclamp.max','effective uclamp.min','effective uclamp.max','se.avg.util_avg','se.avg.util_est'):attrs[key]=val.strip()[:128]
            rows.append({'tid':tid,'main_thread':tid==pid,'name':value['name'],'state':value['state'],'last_cpu':value['last_cpu'],
                         'nice':value['nice'],'cpu_percent_one_core':cpu,'scheduler_runtime_percent':run_pct,
                         'scheduler_runnable_wait_percent':wait_pct,'wchan':read(task/'wchan',128),'scheduler':attrs,
                         'cgroup':read(task/'cgroup',2048) if tid==pid else None})
        main=[r for r in rows if r['main_thread']]
        others=sorted([r for r in rows if not r['main_thread']],key=lambda r:(r['cpu_percent_one_core'] or 0,r['scheduler_runnable_wait_percent'] or 0),reverse=True)[:8]
        return {'pid':pid,'status':status(root/'status'),'launch_flags':selected_flags(process_args(pid,self.proc)),
                'cgroup':group,'cgroup_controls':cgroup_controls(group,self.cgroups),'main_and_hot_threads':main+others,
                'threads_observed':len(rows),'wait_note':'Runnable wait is scheduler queue time, not GPU wait; wchan alone cannot prove where a frame bottlenecks.'}

    def sample(self,game):
        now=time.monotonic();pids=game_pids(self.proc);pid=game.get('pid')
        if type(pid) is int and pid>0 and pid not in pids:pids.insert(0,pid)
        processes=[value for value in (self.process(pid,now) for pid in pids[:8]) if value is not None]
        # Keep a bounded record; retaining all observed threads within this short run is intentional.
        self.previous={key:v for key,v in self.previous.items() if key[0] in pids}
        return {'measured_at':time.time(),'render':render_state(game),'game_process_count':len(processes),'processes':processes,
                'system':system(self.sysroot,self.proc)}


def main():
    parser=argparse.ArgumentParser(description='Coleta de leitura, sem alterar jogo/Android/modelos/chaves.')
    parser.add_argument('--saida',type=Path)
    parser.add_argument('--amostras',type=int,choices=(3,6,12),default=12)
    args=parser.parse_args()
    downloads=Path.home()/'storage/downloads'
    output_dir=downloads if downloads.is_dir() and os.access(downloads,os.W_OK) else Path.home()
    destination=args.saida or output_dir/('COFRA_INVESTIGACAO_GT3_'+datetime.datetime.now().strftime('%Y%m%d_%H%M%S')+'.json')
    if destination.exists():parser.error('A saída já existe. Escolha outro nome; nenhum arquivo foi sobrescrito.')
    game=api('/termux/game')
    if not game or not game.get('running'):parser.error('Deixe o jogo ligado e o painel 127.0.0.1:9393 acessível antes de coletar.')
    report={'collector':'cofra-read-only-investigation','version':VERSION,'metadata':environment(),'presentation':None,'samples':[],
            'scope':'Somente leitura. Sem APK/driver/settings alterados; sem código privado do jogo, ambiente completo, chaves, comentários ou comandos brutos.',
            'notes':['Não é um benchmark de renderização independente. FPS vem do log do Godot.','Arquivos sem permissão ficam null; o coletor não tenta elevar privilégios.','O estado de background deve ser confrontado com UID/cgroup/uclamp e espera; não é inferido de CPU permitida.']}
    config=api('/termux/presentation')
    if config:
        cfg=config.get('settings',{});report['presentation']={key:cfg.get(key) for key in ('profile','clean_display')}
    print('Coleta de leitura preparada. Volte ao Termux:X11 em até 8 segundos e deixe o jogo visível.',flush=True)
    print('Não altere o perfil durante a coleta. A primeira amostra começa em 8 segundos.',flush=True)
    time.sleep(8);probe=Probe()
    try:
        for i in range(args.amostras):
            value=api('/termux/game') or {};report['samples'].append(probe.sample(value))
            print('Amostra '+str(i+1)+'/'+str(args.amostras),flush=True)
            if i+1<args.amostras:time.sleep(2)
    except KeyboardInterrupt:
        report['interrupted_by_user']=True
    destination.parent.mkdir(parents=True,exist_ok=True)
    # Exclusive creation, private permission; never replace existing user output.
    fd=os.open(destination,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,'w') as stream:json.dump(report,stream,ensure_ascii=False,indent=2);stream.write('\n')
    print('Pronto. Arquivo: '+str(destination),flush=True)
    print('Este comando não trocou renderizador, perfil, voz, modelo ou aplicativo.',flush=True)


if __name__=='__main__':main()
