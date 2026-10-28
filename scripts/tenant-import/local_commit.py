"""Synthetic-only executable model of guarded commit/undo. No remote transport."""
import json,os,sqlite3
from pathlib import Path
from workbook import digest,require
from plan import row,pk,TABLES

def check_manifest(plan):
 expected=plan['manifest_sha256'];body={k:v for k,v in plan.items() if k!='manifest_sha256'}
 require(digest(body)==expected,'Manifest changed after validation')
 require(plan['ready_for_approval'],'Manifest is not reconciled/approved-ready')

def synthetic_only(db,environment,binding):
 require(environment=='local-synthetic' and binding=='DB','Preview/production writes are disabled')
 require(db.execute("SELECT name FROM sqlite_master WHERE name='tenant_import_synthetic_only'").fetchone(),'Synthetic database marker required')
 require(not db.execute('PRAGMA foreign_key_check').fetchall(),'Existing foreign-key errors')

def commit(db,plan,batch,approval,environment,binding,interrupt_after=None):
 synthetic_only(db,environment,binding);check_manifest(plan)
 require(approval.get('manifest_sha256')==plan['manifest_sha256'] and approval.get('approved_package_sha256')==plan['approved_package_sha256'] and approval.get('approved_by'),'Explicit matching approval required')
 old=db.execute('SELECT * FROM tenant_import_batches WHERE id=?',(batch,)).fetchone()
 if old:
  require(old['approved_package_sha256']==plan['approved_package_sha256'] and old['parser_version']==plan['parser_version'] and old['source_sha256']==plan['source_sha256'],'Batch belongs to another package')
  if old['status']=='committed':return {'duplicate':True,'created':0}
  require(old['status'] in ('committing','failed','validated'),'Batch needs reconciliation')
 # Validate all referenced records, including no-op links. On resume, persisted
 # change snapshots replace initial expected rows for already committed work.
 persisted={ (r['entity_type'],r['entity_id']):json.loads(r['after_json']) for r in db.execute('SELECT * FROM tenant_import_changes WHERE batch_id=?',(batch,)) }
 for condition in plan.get('preconditions',[]):
  expected=persisted.get((condition['table'],condition['id']),condition['row'])
  require(row(db,condition['table'],condition['id'])==expected,'Stale referenced record; revalidate')
 owner=approval['approved_by']
 if not old:
  db.execute('INSERT INTO tenant_import_batches(id,source_sha256,approved_package_sha256,parser_version,status,requested_by,approved_by,counts_json) VALUES(?,?,?,?,?,?,?,?)',(batch,plan['source_sha256'],plan['approved_package_sha256'],plan['parser_version'],'validated',owner,owner,json.dumps({'changes':len(plan['changes']),'items':len(plan['items'])})));db.commit()
 db.execute("UPDATE tenant_import_batches SET status='committing' WHERE id=?",(batch,));db.commit()
 records=list(dict.fromkeys(i['record_id'] for i in plan['items']));processed=0
 try:
  for record in records:
   owned=[(n,i) for n,i in enumerate(plan['items']) if i['record_id']==record]
   existing=db.execute('SELECT * FROM tenant_import_items WHERE batch_id=? AND record_id=?',(batch,record)).fetchall()
   if existing:
    require(len(existing)==len(owned),'Partial persisted record needs review')
    actual={i['source_cell']:i for i in existing}
    require(all(i['source_cell'] in actual and all(actual[i['source_cell']][k]==v for k,v in i.items()) for _,i in owned),'Persisted mappings differ from manifest')
    continue
   db.execute('BEGIN IMMEDIATE')
   try:
    for condition in plan.get('preconditions',[]):
     expected=persisted.get((condition['table'],condition['id']),condition['row'])
     require(row(db,condition['table'],condition['id'])==expected,'Referenced record changed during commit')
    owned_changes=[(n,c) for n,c in enumerate(plan['changes']) if c['record_id']==record]
    require(2*len(owned_changes)+len(owned)+6<=80,'Record exceeds bounded atomic batch limit; review splitting')
    for n,c in owned_changes:
     require(c['table'] in TABLES,'Invalid table');require(row(db,c['table'],c['id'])==c['before'],'Stale existing record; revalidate')
     data=c['after'];table=c['table'];key=pk(table)
     if c['before'] is None:db.execute(f"INSERT INTO {table} ({','.join(data)}) VALUES ({','.join('?' for _ in data)})",tuple(data.values()))
     else:db.execute(f"UPDATE {table} SET {','.join(k+'=?' for k in data if k!=key)} WHERE {key}=?",tuple(v for k,v in data.items() if k!=key)+(c['id'],))
     after=row(db,table,c['id']);persisted[(table,c['id'])]=after
     db.execute('INSERT INTO tenant_import_changes(id,batch_id,entity_type,entity_id,operation,before_json,after_json,expected_version,actor_id) VALUES(?,?,?,?,?,?,?,?,?)',(batch+':'+str(n),batch,table,c['id'],'create' if c['before'] is None else 'update',json.dumps(c['before']) if c['before'] is not None else None,json.dumps(after),after.get('revision'),owner))
     processed+=1
     if interrupt_after==processed:raise InterruptedError('Synthetic interruption')
    for n,i in owned:
     db.execute('INSERT INTO tenant_import_items(id,batch_id,record_id,source_sha256,source_sheet,source_row,source_cell,tenant_id,unit_id,contact_id,outcome,review_reason,reviewed_by,reviewed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,datetime(\'now\'))',(batch+':'+str(n),batch,i['record_id'],i['source_sha256'],i['source_sheet'],i['source_row'],i['source_cell'],i['tenant_id'],i['unit_id'],i['contact_id'],i['outcome'],i['review_reason'],i['reviewed_by']))
    require(not db.execute('PRAGMA foreign_key_check').fetchall(),'Foreign-key reconciliation failed');db.commit()
   except BaseException:db.rollback();raise
  require(db.execute('SELECT count(*) FROM tenant_import_items WHERE batch_id=?',(batch,)).fetchone()[0]==len(plan['items']),'Manifest item count mismatch')
  require(db.execute('SELECT count(*) FROM tenant_import_changes WHERE batch_id=?',(batch,)).fetchone()[0]==len(plan['changes']),'Manifest change count mismatch')
  db.execute("UPDATE tenant_import_batches SET status='committed',committed_at=datetime('now') WHERE id=?",(batch,));db.commit()
 except BaseException:
  db.execute("UPDATE tenant_import_batches SET status='failed' WHERE id=?",(batch,));db.commit();raise
 return {'duplicate':False,'changes':len(plan['changes']),'items':len(plan['items'])}

def undo(db,batch,environment,binding):
 synthetic_only(db,environment,binding)
 b=db.execute('SELECT * FROM tenant_import_batches WHERE id=?',(batch,)).fetchone();require(b and b['status'] in ('committed','failed'),'Only committed/partially failed batch can be undone')
 changes=db.execute('SELECT * FROM tenant_import_changes WHERE batch_id=? ORDER BY rowid DESC',(batch,)).fetchall()
 db.execute('BEGIN IMMEDIATE')
 try:
  for c in changes:require(row(db,c['entity_type'],c['entity_id'])==json.loads(c['after_json']),'Later edit detected; stop for review')
  # Provenance/audit remain; clear live pointers only after proving no later use.
  # Foreign keys from unrelated operations block deleting any later-used entity.
  db.execute('UPDATE tenant_import_items SET tenant_id=NULL,unit_id=NULL,contact_id=NULL WHERE batch_id=?',(batch,))
  for c in changes:
   table=c['entity_type'];key=pk(table);before=json.loads(c['before_json']) if c['before_json'] else None
   if before is None:db.execute(f'DELETE FROM {table} WHERE {key}=?',(c['entity_id'],))
   else:
    after=json.loads(c['after_json'])
    if isinstance(after.get('revision'),int):before['revision']=after['revision']+1
    db.execute(f"UPDATE {table} SET {','.join(k+'=?' for k in before if k!=key)} WHERE {key}=?",tuple(v for k,v in before.items() if k!=key)+(c['entity_id'],))
  require(not db.execute('PRAGMA foreign_key_check').fetchall(),'Rollback foreign-key error')
  db.execute("UPDATE tenant_import_batches SET status='undone' WHERE id=?",(batch,));db.commit()
 except BaseException:db.rollback();raise
