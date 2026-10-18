#!/usr/bin/env python3
"""Read-only restore preflight. Produces an exact recovery plan; never executes it."""
import argparse,datetime,hashlib,json,pathlib,sys
if not __debug__:
 raise RuntimeError("Run recovery tools without Python optimization; verification assertions are required")
def build(checkpoint,target,targets,now=None):
 checkpoint=pathlib.Path(checkpoint).resolve();m=json.loads((checkpoint/'checkpoint-manifest.json').read_text());expected=targets[target]
 for k in ['account_id','database_id','worker']:assert m[k]==expected[k],f'Refused: {k} mismatch; cross-account restores require a separately reviewed plan'
 for relative,digest in m['files_sha256'].items():
  path=(checkpoint/relative).resolve();assert path.is_relative_to(checkpoint),'Unsafe archive path'
  assert path.is_file(),'Missing checkpoint file: '+relative
  assert hashlib.sha256(path.read_bytes()).hexdigest()==digest,'Checksum mismatch: '+relative
 verification=json.loads((checkpoint/'metadata/restore-verification.json').read_text());assert verification['exact_table_content_match'] and verification['exact_schema_match'] and verification['foreign_key_violations']==0
 deployments=json.loads((checkpoint/'metadata/deployments.json').read_text());latest=max(deployments,key=lambda d:d['created_on']);assert len(latest['versions'])==1 and latest['versions'][0]['percentage']==100,'Weighted deployments need a dedicated recovery plan'
 now=now or datetime.datetime.now(datetime.timezone.utc);created=datetime.datetime.fromisoformat(m['created_at_utc']);age=(now-created).total_seconds();assert age>=-300,'Checkpoint timestamp is in the future'
 bookmark=m.get('exact_bookmark_for_snapshot');quick=bool(bookmark and age<7*86400 and m['bookmark_unchanged_during_export'])
 version=latest['versions'][0]['version_id'];plan={'status':'READY FOR OPERATOR REVIEW — NO RESTORE EXECUTED','target':target,**expected,'checkpoint_created_at_utc':m['created_at_utc'],'age_seconds':round(age),'checksums_verified':len(m['files_sha256']),'database_restore_rehearsal':verification,'worker_version':version,'fast_path_within_free_plan_retention':quick,'bookmark':bookmark if quick else None,'required_before_apply':['Confirm the chosen checkpoint and explicit owner approval for this exact target/time','Pause application edits and capture/verify a current undo checkpoint','Save current Worker version, database bookmark and configuration','Verify the remote account/database still match this plan','Check that the selected bookmark is still available from Cloudflare'], 'database_command':(['wrangler','d1','time-travel','restore',expected['database_id'],'--bookmark',bookmark] if quick else None),'worker_command':['wrangler','rollback',version,'--name',expected['worker'],'--message','Approved coordinated recovery to checkpoint'],'fallback':'Restore the normalized SQL batches into a separately created EMPTY database, verify a fresh export, then approve a binding switch. Never replay these INSERT batches into a populated database.','acceptance':['Export restored data and compare every table/schema fingerprint to the checkpoint','Check account settings, secret names and required external authorization','Check admin login, tenant authorization, property images, contacts, rent roll and maintenance','Only then reopen edits'],'production_guard':'This plan is not permission to release or restore 2Nspira. A production action requires a separate owner approval at the time.'}
 return plan
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--checkpoint',required=True);p.add_argument('--targets',required=True);p.add_argument('--target',required=True);p.add_argument('--output',required=True);a=p.parse_args()
 try:plan=build(a.checkpoint,a.target,json.loads(pathlib.Path(a.targets).read_text()))
 except (AssertionError,ValueError,KeyError,FileNotFoundError) as error:p.exit(2,str(error)+'\n')
 path=pathlib.Path(a.output);path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(plan,indent=2));print('Restore preflight passed. Plan saved; no live data or deployment was changed.')
