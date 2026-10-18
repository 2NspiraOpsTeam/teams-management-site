#!/usr/bin/env python3
"""Offline recovery preparation; never writes to Cloudflare or a live database."""
import argparse,datetime,hashlib,json,pathlib,sqlite3,shutil
if not __debug__:
 raise RuntimeError("Run recovery tools without Python optimization; verification assertions are required")

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def q(v):
 if v is None:return 'NULL'
 if isinstance(v,bytes):return "X'"+v.hex()+"'"
 if isinstance(v,(int,float)):return repr(v)
 if '\x00' in v:return "CAST(X'"+v.encode().hex()+"' AS TEXT)"
 return "'"+v.replace("'","''")+"'"
def ident(v):return '"'+v.replace('"','""')+'"'
def fingerprint(c):
 result={}
 for t, in c.execute("select name from sqlite_master where type='table' order by name"):
  cols=[r[1] for r in c.execute('pragma table_info('+ident(t)+')')]
  rowhash=[]
  for row in c.execute('select * from '+ident(t)):
   typed=[{'type':'blob','hex':v.hex()} if isinstance(v,bytes) else {'type':type(v).__name__,'value':v} for v in row]
   rowhash.append(hashlib.sha256(json.dumps(typed,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest())
  result[t]={'columns':cols,'rows':len(rowhash),'data_sha256':hashlib.sha256('\n'.join(sorted(rowhash)).encode()).hexdigest()}
 schema=[tuple(r) for r in c.execute("select type,name,tbl_name,rtrim(trim(sql),';') from sqlite_master where sql is not null order by type,name")]
 return {'tables':result,'schema_sha256':hashlib.sha256(json.dumps(schema,separators=(',',':')).encode()).hexdigest()}
def prepare(args):
 sql=pathlib.Path(args.sql).resolve();out=pathlib.Path(args.output).resolve();out.mkdir(parents=True,exist_ok=False)
 (out/'restore-batches').mkdir();shutil.copy2(sql,out/'original-export.sql')
 source=sqlite3.connect(out/'snapshot.sqlite');source.row_factory=sqlite3.Row;source.executescript(sql.read_text());source.execute('pragma foreign_keys=ON')
 assert source.execute('pragma integrity_check').fetchone()[0]=='ok'
 assert not list(source.execute('pragma foreign_key_check'))
 schema=[dict(r) for r in source.execute("select type,name,tbl_name,sql from sqlite_master where sql is not null and name not like 'sqlite_%'")]
 tables=[r['name'] for r in schema if r['type']=='table'];fks={t:list(source.execute('pragma foreign_key_list('+ident(t)+')')) for t in tables}
 remaining=set(tables);order=[]
 while remaining:
  ready=sorted(t for t in remaining if all(f['table'] not in remaining or f['table']==t for f in fks[t]))
  assert ready,('Cyclic FK component requires a dedicated atomic restore',remaining)
  order+=ready;remaining-=set(ready)
 groups=[['PRAGMA defer_foreign_keys=ON;']+[r['sql']+';' for r in schema if r['type']=='table']]
 largest=0
 for t in order:
  info=list(source.execute('pragma table_info('+ident(t)+')'));cols=[r['name'] for r in info];pk=[r['name'] for r in sorted(info,key=lambda r:r['pk']) if r['pk']]
  for raw in source.execute('select * from '+ident(t)):
   r=dict(raw);long={k:v for k,v in r.items() if isinstance(v,(str,bytes)) and len(v)>7000};small={k:(v[:7000] if k in long else v) for k,v in r.items()}
   assert not long or pk,('Large row needs a stable key',t)
   statements=['INSERT INTO '+ident(t)+' ('+','.join(map(ident,cols))+') VALUES ('+','.join(q(small[k]) for k in cols)+');']
   where=' AND '.join(ident(k)+' IS '+q(r[k]) for k in pk)
   for k,v in long.items():
    for offset in range(7000,len(v),7000):
     expr=ident(k)+'||'+q(v[offset:offset+7000]);expr='CAST('+expr+' AS BLOB)' if isinstance(v,bytes) else expr
     statements.append('UPDATE '+ident(t)+' SET '+ident(k)+'='+expr+' WHERE '+where+';')
   largest=max(largest,max(len(z.encode()) for z in statements));assert largest<90000,('Statement too large',t)
   groups.append(statements)
 if source.execute("select 1 from sqlite_master where name='sqlite_sequence'").fetchone():
  groups.append(['DELETE FROM sqlite_sequence;']+['INSERT INTO sqlite_sequence(name,seq) VALUES('+q(r[0])+','+q(r[1])+');' for r in source.execute('select name,seq from sqlite_sequence')])
 groups.append([r['sql']+';' for r in schema if r['type'] in ['index','view','trigger']])
 chunks=[];current=[];size=0;count=0
 for g in groups:
  n=sum(len(x.encode())+1 for x in g)
  if current and (size+n>1500000 or count+len(g)>250):chunks.append(current);current=[];size=0;count=0
  current.extend(g);size+=n;count+=len(g)
 if current:chunks.append(current)
 restored=sqlite3.connect(out/'restore-rehearsal.sqlite');restored.row_factory=sqlite3.Row;restored.execute('pragma foreign_keys=ON');batches=[]
 for i,stmts in enumerate(chunks):
  body='PRAGMA defer_foreign_keys=ON;\n'+'\n'.join(stmts)+'\n';name=f'restore-batches/{i:04d}.sql';f=out/name;f.write_text(body)
  restored.executescript('BEGIN;\n'+body);assert not list(restored.execute('pragma foreign_key_check')),i;restored.commit()
  batches.append({'file':name,'sha256':sha(f),'bytes':f.stat().st_size,'statements':len(stmts)})
 expected=fingerprint(source);actual=fingerprint(restored);assert expected==actual,'Restored snapshot differs from original'
 assert restored.execute('pragma integrity_check').fetchone()[0]=='ok'
 checks={'exact_table_content_match':True,'exact_schema_match':True,'integrity_check':'ok','foreign_key_violations':0,'largest_statement_bytes':largest,'database_tables_including_sequence':len(expected['tables']),'batch_count':len(batches),'verification_scope':'SQLite full restore rehearsal; cloud restore not yet exercised'}
 manifest={'format':'teams-recovery-v1','created_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'account_id':args.account,'database_id':args.database,'original_export_sha256':sha(out/'original-export.sql'),'snapshot_logical_fingerprint':expected,'verification':checks,'restore_batches':batches,'restore_target_rule':'Use a new empty isolated database, or separately approved Time Travel in-place rollback. Never import these INSERT batches into an existing populated database.'}
 (out/'manifest.json').write_text(json.dumps(manifest,indent=2))
 # Keep bulky working SQLite files outside the deliverable; the SQL package is portable.
 source.close();restored.close();(out/'snapshot.sqlite').unlink();(out/'restore-rehearsal.sqlite').unlink()
 print(json.dumps(checks,indent=2))
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--sql',required=True);p.add_argument('--output',required=True);p.add_argument('--account',required=True);p.add_argument('--database',required=True);prepare(p.parse_args())
