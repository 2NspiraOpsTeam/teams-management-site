#!/usr/bin/env python3
"""Private preparation CLI. Writes are synthetic-local only; default = dry-run."""
import argparse,getpass,json,os,sqlite3
from pathlib import Path
from workbook import load,report,validate_against,require,filehash
from plan import make_plan
from local_commit import commit,undo,check_manifest

def read(p):return json.loads(Path(p).read_text())
def private_write(path,value):
 p=Path(path).resolve();require(not any(x in p.parts for x in ('.git','public')),'Output must be private')
 # Never store real source artifacts anywhere in the repository.
 repo=Path(__file__).resolve().parents[2];require(not p.is_relative_to(repo),'Use private staging outside repository')
 p.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as f:json.dump(value,f,ensure_ascii=False,indent=2)

def main():
 a=argparse.ArgumentParser();a.add_argument('action',choices=['inspect','dry-run','seal','commit','undo'],nargs='?',default='dry-run')
 for opt in ['workbook','baseline','database','staging','output','manifest','approval','batch-id','backup','source']:a.add_argument('--'+opt)
 a.add_argument('--environment',default='local-synthetic');a.add_argument('--binding',default='DB');args=a.parse_args()
 require(args.output,'Private output path required')
 if args.action=='inspect':
  p=load(args.workbook)
  if args.source:require(filehash(args.source)==p['source_sha256'],'Source snapshot hash mismatch')
  private_write(args.output,p);print(json.dumps(report(p)));return
 if args.action=='dry-run':
  p=validate_against(load(args.workbook),read(args.baseline));summary=report(p)
  if args.database:
   # Clone inventory to memory: validation savepoints never mutate input snapshot.
   src=sqlite3.connect(Path(args.database).resolve().as_uri()+'?mode=ro',uri=True);db=sqlite3.connect(':memory:');src.backup(db);src.close();db.row_factory=sqlite3.Row;db.execute('PRAGMA foreign_keys=ON')
   result=make_plan(p,db,read(args.staging) if args.staging else {});db.close();result['reconciliation']=summary
   # Re-seal after adding reconciliation summary.
   from workbook import digest
   del result['manifest_sha256'];result['manifest_sha256']=digest(result)
  else:result={'reconciliation':summary,'ready_for_approval':False,'reason':'Existing-ID inventory snapshot and source-cell review required','proposed_creates':0,'proposed_updates':0,'proposed_links':0}
  private_write(args.output,result);print(json.dumps(summary));return
 require(args.environment=='local-synthetic','Preview/production writes are disabled')
 plan=read(args.manifest) if args.manifest else None
 if args.action=='seal':
  check_manifest(plan);private_write(args.output,{'manifest_sha256':plan['manifest_sha256'],'approved_package_sha256':plan['approved_package_sha256'],'approved_by':'local-synthetic:'+getpass.getuser()});return
 require(args.database and args.batch_id and args.backup,'Explicit local DB, batch ID and backup required')
 db=sqlite3.connect(args.database);db.row_factory=sqlite3.Row;db.execute('PRAGMA foreign_keys=ON')
 from local_commit import synthetic_only
 synthetic_only(db,args.environment,args.binding)
 backup=Path(args.backup);require(not backup.exists(),'Backup path already exists')
 os.close(os.open(backup,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600));dest=sqlite3.connect(backup);db.backup(dest);dest.close()
 result=commit(db,plan,args.batch_id,read(args.approval),args.environment,args.binding) if args.action=='commit' else undo(db,args.batch_id,args.environment,args.binding)
 private_write(args.output,{'result':result,'backup_sha256':filehash(backup)});db.close()
if __name__=='__main__':
 try:main()
 except (ValueError,KeyError,TypeError) as e:raise SystemExit('Import stopped: '+str(e))
