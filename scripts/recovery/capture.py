#!/usr/bin/env python3
"""Capture an immutable environment checkpoint and rehearse its complete DB restore.
Read-only Cloudflare operations only. This program cannot apply or delete data.
"""
import argparse,datetime,hashlib,json,os,pathlib,shutil,subprocess,sys
if not __debug__:
 raise RuntimeError("Run recovery tools without Python optimization")
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--wrangler',required=True);p.add_argument('--config-home',required=True);p.add_argument('--node-directory',required=True);p.add_argument('--repository',required=True);p.add_argument('--output',required=True);p.add_argument('--account',required=True);p.add_argument('--database',required=True);p.add_argument('--worker',required=True);p.add_argument('--worker-config',required=True);a=p.parse_args();ACCOUNT=a.account;DB=a.database;WORKER=a.worker
config_path=pathlib.Path(a.worker_config).resolve();cfg=json.loads(config_path.read_text());assert cfg['account_id']==ACCOUNT and cfg['name']==WORKER and any(x['database_id']==DB for x in cfg['d1_databases']), 'Explicit target and Worker config disagree'
out=pathlib.Path(a.output).resolve();out.mkdir(parents=True,exist_ok=False);out.chmod(0o700);repo=pathlib.Path(a.repository).resolve();tool=pathlib.Path(a.wrangler).resolve();env=dict(os.environ,CLOUDFLARE_ACCOUNT_ID=ACCOUNT,XDG_CONFIG_HOME=str(pathlib.Path(a.config_home).resolve()));env['PATH']=str(pathlib.Path(a.node_directory).resolve())+os.pathsep+env['PATH']
meta=out/'metadata';meta.mkdir();private=out/'private-logs';private.mkdir(mode=0o700)
def run(name,args,json_result=False):
 result=subprocess.run([str(tool)]+args,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 (private/(name+'.stdout')).write_text(result.stdout);(private/(name+'.stderr')).write_text(result.stderr)
 if result.returncode:raise RuntimeError('Capture failed: '+name+'; inspect private logs. No remote data was changed.')
 if json_result:
  value=json.loads(result.stdout);(meta/(name+'.json')).write_text(json.dumps(value,indent=2));return value
before=run('bookmark-before',['d1','time-travel','info',DB,'--json'],True)
run('database-export',['d1','export',DB,'--remote','--output',str(out/'database.sql')])
after=run('bookmark-after',['d1','time-travel','info',DB,'--json'],True)
config=str(config_path)
run('deployments',['deployments','list','--config',config,'--json'],True)
run('secret-names',['secret','list','--config',config],True)
shutil.copy2(config_path,meta/'worker-config.json')
for name in ['open-next.config.ts','open-next.waterbear.config.ts','package.json','package-lock.json','pnpm-lock.yaml']:
 if (repo/name).exists():shutil.copy2(repo/name,meta/name)
(meta/'source-base-revision.txt').write_text(subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True))
(meta/'tracked-source-changes.patch').write_bytes(subprocess.check_output(['git','diff'],cwd=repo))
shutil.copytree(repo/'deployment',meta/'deployment')
# Capture exactly the local build/static tree; version metadata identifies whether it is live.
# Do not infer that this local build is the deployed version.
shutil.copytree(repo/'public',out/'static-public-files')
shutil.copytree(repo/'.open-next',out/'local-build',ignore=shutil.ignore_patterns('cache'))
subprocess.run([sys.executable,str(pathlib.Path(__file__).with_name('verify_and_package.py')),'--sql',str(out/'database.sql'),'--output',str(out/'verified-database'),'--account',ACCOUNT,'--database',DB],check=True,stdout=(meta/'restore-verification.json').open('w'))
files={str(f.relative_to(out)):hashlib.sha256(f.read_bytes()).hexdigest() for f in out.rglob('*') if f.is_file() and 'private-logs' not in f.parts}
manifest={'format':'teams-checkpoint-v1','created_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'account_id':ACCOUNT,'database_id':DB,'worker':WORKER,'bookmark_unchanged_during_export':before==after,'exact_bookmark_for_snapshot':before.get('bookmark') if before==after else None,'files_sha256':files,'credentials':'Secret values and OAuth tokens intentionally absent. Names only. Reuse retained Cloudflare versions and separately protected credential records.','restore_scope':'DB restored exactly in local rehearsal. Cloud restore and complete app disaster recovery require an isolated cloud drill; not yet verified. Local build is included but must be matched to the deployed version before claiming exact application recovery.'}
(out/'checkpoint-manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({k:v for k,v in manifest.items() if k!='files_sha256'},indent=2))
