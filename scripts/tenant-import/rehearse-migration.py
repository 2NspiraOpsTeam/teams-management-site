"""Private local D1 export/restore/preservation rehearsal. No remote option exists.

Uses a private inventory copy, adds a labelled test session locally, and reconstructs
the original NOT NULL prerequisite before testing. Never modifies the source copy.
"""
import argparse, hashlib, json, os, sqlite3, subprocess
from pathlib import Path
from workbook import digest, filehash

REPO=Path(__file__).resolve().parents[2]
def run(args, log):
 with log.open('a') as out: subprocess.run(['npx','wrangler',*args],cwd=REPO,stdout=out,stderr=out,check=True)
def d1(args,state,log): run(['d1',*args,'teams-security-local','--config','wrangler.worker.jsonc','--local','--persist-to',str(state)],log)
def localdb(state):
 files=[f for f in state.glob('v3/d1/miniflare-D1DatabaseObject/*.sqlite') if f.name!='metadata.sqlite'];assert len(files)==1,'Expected exactly one isolated local DB';return files[0]
def snapshot(path):
 db=sqlite3.connect(path.resolve().as_uri()+'?mode=ro',uri=True)
 tables=[r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name")]
 result={}
 for t in tables:
  quoted='"'+t.replace('"','""')+'"';rows=db.execute('SELECT * FROM '+quoted).fetchall()
  indexes=[]
  for idx in db.execute('PRAGMA index_list('+quoted+')').fetchall():
   indexes.append((idx[1],idx[2],idx[3],idx[4],db.execute('PRAGMA index_info("'+idx[1].replace('"','""')+'")').fetchall()))
  result[t]={'rows':len(rows),'content_sha256':digest(sorted(rows,key=lambda r:json.dumps(r,default=str))),
   'columns':db.execute('PRAGMA table_info('+quoted+')').fetchall(),'foreign_keys':db.execute('PRAGMA foreign_key_list('+quoted+')').fetchall(),'indexes':sorted(indexes),'triggers':db.execute("SELECT name,sql FROM sqlite_master WHERE type='trigger' AND tbl_name=? ORDER BY name",(t,)).fetchall()}
 assert db.execute('PRAGMA foreign_key_check').fetchall()==[],'Foreign key violation'
 db.close();return result

if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--inventory',required=True);a.add_argument('--output-directory',required=True);v=a.parse_args()
 target=Path(v.output_directory).resolve();assert not target.exists(),'Use a fresh private rehearsal directory';assert not target.is_relative_to(REPO),'Private output must stay outside repo';target.mkdir(mode=0o700,parents=True);os.umask(0o077)
 source=sqlite3.connect(Path(v.inventory).resolve().as_uri()+'?mode=ro',uri=True);copy=sqlite3.connect(target/'fixture.sqlite');source.backup(copy);source.close()
 migration=(REPO/'src/lib/migrations/tenant-directory-identity-nullable.sql').read_text()
 assert copy.execute('SELECT count(*) FROM tenant_accounts WHERE email IS NULL').fetchone()[0]==0,'Original-constraint fixture requires existing login identities'
 copy.execute('PRAGMA foreign_keys=ON')
 copy.executescript('BEGIN;'+migration.replace('email TEXT UNIQUE','email TEXT NOT NULL UNIQUE')+'COMMIT;')
 tenant=copy.execute('SELECT id FROM tenant_accounts ORDER BY id LIMIT 1').fetchone()[0]
 copy.execute("INSERT INTO tenant_sessions(token_hash,tenant_id,expires_at) VALUES(?,?,datetime('now','+1 day'))",('qa-local-rehearsal-session',tenant))
 assignment,unit=copy.execute('SELECT id,unit_id FROM tenant_assignments WHERE tenant_id=? ORDER BY id LIMIT 1',(tenant,)).fetchone()
 copy.execute("INSERT INTO tenant_maintenance_requests(id,tenant_id,assignment_id,category,description,urgency,preferred_contact,status,staff_notes) VALUES('qa-restore-request',?,?,'other','Synthetic restoration history','routine','email','completed','Synthetic private note')",(tenant,assignment))
 copy.execute("UPDATE work_order_details SET completed_at='2026-10-14' WHERE request_id='qa-restore-request'")
 copy.execute("INSERT INTO work_order_events(id,request_id,kind,visibility,status,body,actor_type,actor_id) VALUES('qa-restore-event','qa-restore-request','status','internal','completed','Synthetic history','admin','qa@example.test')")
 copy.execute("INSERT INTO work_order_notifications(id,request_id,event_id,audience,state) VALUES('qa-restore-notification','qa-restore-request','qa-restore-event','management','sent')")
 copy.execute("INSERT INTO operations_work_order_profiles(request_id,workflow_status) VALUES('qa-restore-request','completed')")
 copy.execute("INSERT INTO operations_leases(id,unit_id,lease_start,lease_end,monthly_rent_cents,status) VALUES('qa-restore-lease',?,'2026-01-01','2026-12-31',0,'active')",(unit,))
 copy.execute("INSERT INTO operations_leaseholders(lease_id,tenant_id,holder_role) VALUES('qa-restore-lease',?,'leaseholder')",(tenant,))
 copy.commit()
 dump_statements=[s for s in copy.iterdump() if s not in ('BEGIN TRANSACTION;','COMMIT;')]
 # Create every referenced table before inserts; Wrangler imports statements separately.
 dump='\n'.join([s for s in dump_statements if s.startswith('CREATE TABLE')]+[s for s in dump_statements if not s.startswith('CREATE TABLE')]);copy.close()
 seed=target/'fixture.sql';seed.write_text('PRAGMA defer_foreign_keys=ON;\n'+dump)
 log=target/'wrangler.log';state=target/'migration-state';restore=target/'restoration-state'
 d1(['execute','--file',str(seed)],state,log);before=snapshot(localdb(state));assert any(c[1]=='email' and c[3]==1 for c in before['tenant_accounts']['columns'])
 backup=target/'verified-before.sqlite'
 original=sqlite3.connect(localdb(state).resolve().as_uri()+'?mode=ro',uri=True);back=sqlite3.connect(backup);original.backup(back);original.close()
 assert snapshot(backup)==before,'Backup copy differs'
 statements=[s for s in back.iterdump() if s not in ('BEGIN TRANSACTION;','COMMIT;') and '_cf_' not in s];back.close()
 restore_sql=target/'verified-before.sql';restore_sql.write_text('PRAGMA defer_foreign_keys=ON;\n'+'\n'.join([s for s in statements if s.startswith('CREATE TABLE')]+[s for s in statements if not s.startswith('CREATE TABLE')]))
 d1(['execute','--file',str(restore_sql)],restore,log);restored=snapshot(localdb(restore));assert restored==before,'Backup restoration differs'
 failure_sql=target/'forced-failure.sql';failure_sql.write_text(migration+'\nINSERT INTO qa_nonexistent_migration_guard VALUES(1);')
 try:d1(['execute','--file',str(failure_sql)],state,log)
 except subprocess.CalledProcessError:pass
 else:raise AssertionError('Forced failure did not fail')
 assert snapshot(localdb(state))==before,'Migration file execution was not atomic; require D1 batch execution'
 d1(['execute','--file',str(REPO/'src/lib/migrations/tenant-directory-identity-nullable.sql')],state,log);after=snapshot(localdb(state))
 assert before.keys()==after.keys(),'Unexpected table change'
 for table in before:
  assert before[table]['content_sha256']==after[table]['content_sha256'],'Protected rows changed: '+table
  assert before[table]['indexes']==after[table]['indexes'],'Indexes changed: '+table
  assert before[table]['foreign_keys']==after[table]['foreign_keys'],'References changed: '+table
  assert before[table]['triggers']==after[table]['triggers'],'Triggers changed: '+table
  if table!='tenant_accounts':assert before[table]['columns']==after[table]['columns'],'Unexpected schema change: '+table
 assert any(c[1]=='email' and c[3]==0 for c in after['tenant_accounts']['columns'])
 evidence={'local_only':True,'shared_database_changed':False,'backup_sha256':filehash(backup),'restoration_verified':True,'protected_tables':len(before),'protected_rows':sum(t['rows'] for t in before.values()),'existing_ids_and_values_preserved':True,'assignments_preserved':True,'sessions_preserved':True,'all_history_tables_preserved':True,'indexes_preserved':True,'triggers_preserved':True,'forced_migration_failure_rolled_back':True,'foreign_key_check':'clean','fixture_session_and_maintenance_history_added_locally':True,'migration_sha256':filehash(REPO/'src/lib/migrations/tenant-directory-identity-nullable.sql'),'before':before,'after':after}
 (target/'evidence.json').write_text(json.dumps(evidence,indent=2));print(json.dumps({k:x for k,x in evidence.items() if k not in ('before','after')}))
