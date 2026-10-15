"""Build entirely synthetic manifests against an explicit marked local D1 SQLite file."""
import argparse,hashlib,json,sqlite3,time
from pathlib import Path
from test_import import ImportTests
from plan import make_plan
p=argparse.ArgumentParser();p.add_argument('--database',required=True);p.add_argument('--output',required=True);args=p.parse_args()
src=sqlite3.connect(Path(args.database).resolve().as_uri()+'?mode=ro',uri=True);db=sqlite3.connect(':memory:');src.backup(db);src.close();db.row_factory=sqlite3.Row;db.execute('PRAGMA foreign_keys=ON')
assert db.execute("SELECT name FROM sqlite_master WHERE name='tenant_import_synthetic_only'").fetchone(),'Synthetic DB marker required'
backup=sqlite3.connect(args.output+'.backup.sqlite');db.backup(backup);backup.close();backup_sha=hashlib.sha256(Path(args.output+'.backup.sqlite').read_bytes()).hexdigest()
result={};suffix=str(time.time_ns())
for scenario in ['resume','stale','later_use','audit_failure']:
 fixture=ImportTests();fixture.setUp();package=fixture.package;stage=fixture.stage;fixture.tearDown();package['source_sha256']=hashlib.sha256(('synthetic-'+scenario+suffix).encode()).hexdigest()
 plan=make_plan(package,db,stage);assert plan['ready_for_approval'],plan['conflicts'];result[scenario]={'plan':plan,'approval':{'approved_by':'qa-admin@example.test','backup_sha256':backup_sha,'manifest_sha256':plan['manifest_sha256'],'approved_package_sha256':plan['approved_package_sha256']},'batchId':'qa-d1-'+scenario+'-'+suffix}
Path(args.output).write_text(json.dumps(result))
