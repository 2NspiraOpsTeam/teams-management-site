import copy,json,sqlite3,tempfile,unittest
from pathlib import Path
import openpyxl
from workbook import HEADERS,SOURCE_SHA,digest,load,validate_against
from plan import make_plan,contact_value
from local_commit import commit,undo,check_manifest
ROOT=Path(__file__).resolve().parents[2]
class ImportTests(unittest.TestCase):
 def setUp(self):
  self.db=sqlite3.connect(':memory:');self.db.row_factory=sqlite3.Row;self.db.execute('PRAGMA foreign_keys=ON')
  for f in ['schema.sql','admin-phase1.sql','admin-otp.sql','tenant-portal.sql','work-orders-mvp.sql','property-operations.sql']:
   self.db.executescript((ROOT/'src/lib/migrations'/f).read_text())
  self.db.executescript('BEGIN;'+(ROOT/'src/lib/migrations/tenant-directory-identity-nullable.sql').read_text()+'COMMIT;')
  self.db.executescript((ROOT/'src/lib/migrations/tenant-directory-import.sql').read_text())
  self.db.executescript("CREATE TABLE tenant_import_synthetic_only(id); INSERT INTO buildings(id,name,slug,address_json) VALUES('p','QA Property','qa','{}');INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES('u','p','001A',1),('store','p','STORE-A',0);")
  self.package={'source_sha256':SOURCE_SHA,'parser_version':'teams-one-time-1','workbook_sha256':'synthetic','Import Review':[],'Contacts':[],'Property Map':[{'property_map_key':'m','decision':'approve','existing_property_id':'p'}],'Source Cells':[]}
  self.stage={'source_cell_review':{}}
  for n in (1,2):
   r={'record_id':'qa-'+str(n),'decision':'approve','property_map_key':'m','existing_property_id':'p','existing_unit_id':'u','unit_label_proposed':'001A','tenant_name_proposed':'QA Person '+str(n),'existing_tenant_id':'','source_sheet':'QA','source_row':n,'source_customer_raw':'QA Person '+str(n),'reviewer':'QA reviewer','review_note':'Synthetic verified inventory'}
   c={'record_id':r['record_id'],'source_sheet':'QA','source_cell':'C'+str(n),'contact_type':'email','contact_value_raw':'Shared@Example.test','country_confirmed':'','validation_state':'unreviewed','decision':'approve'}
   self.package['Import Review'].append(r);self.package['Contacts'].append(c);self.package['Source Cells'].append({'source_sheet':'QA','source_cell':c['source_cell']})
   self.stage['source_cell_review']['QA!'+c['source_cell']]={'decision':'mapped','reviewer':'QA reviewer','reason':'Reviewed synthetic source'}
 def tearDown(self):self.db.close()
 def plan(self):return make_plan(self.package,self.db,self.stage)
 def approve(self,p):return {'manifest_sha256':p['manifest_sha256'],'approved_package_sha256':p['approved_package_sha256'],'approved_by':'QA reviewer'}
 def apply(self,p=None,interrupt=None):
  p=p or self.plan();return commit(self.db,p,'qa-batch',self.approve(p),'local-synthetic','DB',interrupt)
 def test_shared_contacts_multiple_tenants_and_proposed_unit_links(self):
  p=self.plan();self.assertTrue(p['ready_for_approval'],p['conflicts']);self.apply(p)
  self.assertEqual(self.db.execute('SELECT count(*) FROM tenant_accounts').fetchone()[0],2)
  self.assertEqual(self.db.execute('SELECT count(*) FROM tenant_contacts').fetchone()[0],2)
  self.assertEqual(self.db.execute('SELECT sum(active) FROM tenant_assignments').fetchone()[0],0)
  self.assertEqual(self.db.execute('SELECT sum(active) FROM tenant_accounts').fetchone()[0],0)
  self.assertFalse(self.db.execute('PRAGMA foreign_key_check').fetchall())
 def test_rerun_has_zero_duplicates_and_modified_package_rejected(self):
  p=self.plan();self.apply(p);self.assertTrue(self.apply(p)['duplicate']);tampered=copy.deepcopy(p);tampered['changes'][0]['after']['display_name']='Tampered'
  with self.assertRaises(ValueError):self.apply(tampered)
 def test_interrupted_atomic_commit_can_resume(self):
  p=self.plan()
  with self.assertRaises(InterruptedError):self.apply(p,interrupt=3)
  self.assertEqual(self.db.execute('SELECT count(*) FROM tenant_accounts').fetchone()[0],0)
  self.apply(p);self.assertTrue(self.apply(p)['duplicate'])
 def test_undo_preserves_later_edits(self):
  p=self.plan();self.apply(p);self.db.execute("UPDATE operations_tenants SET revision=revision+1");self.db.commit()
  with self.assertRaises(ValueError):undo(self.db,'qa-batch','local-synthetic','DB')
  self.assertEqual(self.db.execute('SELECT count(*) FROM tenant_accounts').fetchone()[0],2)
 def test_undo_deletes_only_unused_created_rows_and_retains_audit(self):
  self.apply();undo(self.db,'qa-batch','local-synthetic','DB')
  self.assertEqual(self.db.execute('SELECT count(*) FROM tenant_accounts').fetchone()[0],0)
  self.assertEqual(self.db.execute('SELECT count(*) FROM units').fetchone()[0],2)
  self.assertGreater(self.db.execute('SELECT count(*) FROM tenant_import_changes').fetchone()[0],0)
  self.assertEqual(self.db.execute("SELECT count(*) FROM tenant_import_items WHERE source_cell='@row' AND tenant_id IS NULL AND resolved_tenant_id IS NOT NULL").fetchone()[0],2)
 def test_preview_and_production_writes_disabled(self):
  p=self.plan()
  for env in ['preview','production','local']:
   with self.assertRaises(ValueError):commit(self.db,p,'b',self.approve(p),env,'DB')
 def test_property_unit_mismatch_missing_id_and_numeric_labels(self):
  for changes in [{'existing_property_id':'unknown'},{'existing_unit_id':'missing'},{'unit_label_proposed':1},{'existing_unit_id':''}]:
   original=copy.deepcopy(self.package);self.package['Import Review'][0].update(changes);self.assertFalse(self.plan()['ready_for_approval']);self.package=original
 def test_repeats_need_explicit_distinct_entity_evidence(self):
  self.package['Import Review'][1]['tenant_name_proposed']='QA Person 1';self.assertFalse(self.plan()['ready_for_approval']);self.stage['distinct_repeats']={'qa-1':'Distinct documented business','qa-2':'Distinct documented business'};self.assertTrue(self.plan()['ready_for_approval'])
 def test_holds_exclusions_and_unapproved_parent(self):
  self.package['Import Review'][0]['decision']='exclude_non_tenant';self.assertFalse(self.plan()['ready_for_approval']);self.package['Contacts'][0]['decision']='exclude';p=self.plan();self.assertTrue(p['ready_for_approval']);self.assertEqual(len([i for i in p['items'] if i['outcome']=='exclude']),2)
 def test_country_splitting_extensions_and_raw_spelling(self):
  c=self.package['Contacts'][0];v=contact_value(c,{})[0];self.assertEqual(v['value_raw'],'Shared@Example.test');self.assertEqual(v['value_normalized'],'shared@example.test');c={**c,'contact_type':'phone','contact_value_raw':'212 555 0123 ext 9'};v=contact_value(c,{})[0];self.assertIsNone(v['value_normalized']);v=contact_value(c,{'country':'US','reviewer':'QA','reason':'Confirmed country'})[0];self.assertEqual(v['extension'],'9')
  c={**c,'contact_type':'email','contact_value_raw':'one@example.test; two@example.test'}
  with self.assertRaises(ValueError):contact_value(c,{})
  self.assertEqual(len(contact_value(c,{'values':['one@example.test','two@example.test'],'reviewer':'QA','reason':'Confirmed split'})),2)
 def test_source_cell_accounting_and_provenance_conflict(self):
  del self.stage['source_cell_review']['QA!C1'];self.assertFalse(self.plan()['ready_for_approval']);self.stage['source_cell_review']['FAKE!C1']={'decision':'mapped','reviewer':'QA','reason':'invalid'}
  with self.assertRaises(ValueError):self.plan()
 def test_workbook_headers_formulas_ids_and_immutable_source(self):
  with tempfile.TemporaryDirectory() as d:
   path=Path(d)/'review.xlsx';w=openpyxl.Workbook();w.active.title='Start Here';w.active.append(['Source SHA-256',SOURCE_SHA])
   for name,head in HEADERS.items():w.create_sheet(name).append(head)
   r={k:'' for k in HEADERS['Import Review']};r.update(record_id='synthetic',source_customer_raw='QA',source_sheet='QA',source_row=1,property_map_key='m');w['Import Review'].append([r[k] for k in HEADERS['Import Review']]);w.save(path);baseline=load(path)
   edited=copy.deepcopy(baseline);edited['Import Review'][0]['record_id']='unknown'
   with self.assertRaises(ValueError):validate_against(edited,baseline)
   edited=copy.deepcopy(baseline);edited['Import Review'][0]['source_customer_raw']='changed'
   with self.assertRaises(ValueError):validate_against(edited,baseline)
   w['Import Review']['H2']='=HYPERLINK("https://example.test","QA")';w.save(path)
   with self.assertRaises(ValueError):load(path)

 def test_resume_preserves_an_earlier_committed_record(self):
  p=self.plan();first=sum(c['record_id']=='qa-1' for c in p['changes'])
  with self.assertRaises(InterruptedError):self.apply(p,interrupt=first+1)
  self.assertEqual(self.db.execute('SELECT count(*) FROM tenant_accounts').fetchone()[0],1)
  self.apply(p);self.assertEqual(self.db.execute('SELECT count(*) FROM tenant_accounts').fetchone()[0],2)
 def test_stale_unit_version_rejects_approved_noop_link(self):
  self.db.execute("INSERT INTO operations_units(unit_id) VALUES('u')");self.db.commit();p=self.plan();self.db.execute("UPDATE operations_units SET revision=revision+1 WHERE unit_id='u'");self.db.commit()
  with self.assertRaises(ValueError):self.apply(p)
  self.assertEqual(self.db.execute('SELECT count(*) FROM tenant_accounts').fetchone()[0],0)
 def test_later_operational_use_blocks_undo_without_partial_deletion(self):
  self.apply();tenant=self.db.execute('SELECT id FROM tenant_accounts LIMIT 1').fetchone()[0];self.db.execute("INSERT INTO tenant_sessions(token_hash,tenant_id,expires_at) VALUES('qa-later-session',?,datetime('now','+1 day'))",(tenant,));self.db.commit()
  with self.assertRaises(sqlite3.IntegrityError):undo(self.db,'qa-batch','local-synthetic','DB')
  self.assertEqual(self.db.execute('SELECT count(*) FROM tenant_accounts').fetchone()[0],2)
 def test_additional_reviewed_candidate_retains_original_coordinates(self):
  self.package['Source Cells'].append({'source_sheet':'QA','source_cell':'B3','source_value_raw':'QA Omitted Business'})
  r={**self.package['Import Review'][0],'record_id':'A-'+digest([SOURCE_SHA,'QA','B3'])[:16],'source_row':3,'source_customer_raw':'QA Omitted Business','tenant_name_proposed':'QA Omitted Business'}
  self.stage['additional_candidates']=[{'record':r,'customer_cell':'B3','contacts':[]}];self.stage['source_cell_review']['QA!B3']={'decision':'candidate_reviewed','reviewer':'QA','reason':'Documented omitted candidate'}
  p=self.plan();self.assertTrue(p['ready_for_approval'],p['conflicts']);self.assertEqual(p['additional_candidate_count'],1)

 def test_existing_name_update_undo_preserves_login_and_advances_revision(self):
  self.db.execute("INSERT INTO tenant_accounts(id,email,display_name,active) VALUES('existing','identity@example.test','Before',1)");self.db.execute("INSERT INTO operations_tenants(tenant_id,revision) VALUES('existing',4)");self.db.commit()
  before=dict(self.db.execute("SELECT * FROM tenant_accounts WHERE id='existing'").fetchone());r=self.package['Import Review'][0];r['existing_tenant_id']='existing';r['tenant_name_proposed']='After';self.stage['updates']={r['record_id']:{'before':before,'display_name':'After','reason':r['review_note']}}
  p=self.plan();self.assertTrue(p['ready_for_approval'],p['conflicts']);self.apply(p);undo(self.db,'qa-batch','local-synthetic','DB')
  self.assertEqual(self.db.execute("SELECT display_name FROM tenant_accounts WHERE id='existing'").fetchone()[0],'Before');self.assertEqual(self.db.execute("SELECT revision FROM operations_tenants WHERE tenant_id='existing'").fetchone()[0],6);self.assertEqual(self.db.execute("SELECT email FROM tenant_accounts WHERE id='existing'").fetchone()[0],'identity@example.test')
 def test_preparation_validation_hints_never_mark_contacts_verified(self):
  c=self.package['Contacts'][0]
  for hint in ['syntax_only','country_confirmation_required','review']:
   v=contact_value({**c,'validation_state':hint},{})[0];self.assertNotEqual(v['validation_state'],'verified');self.assertIsNone(v['verified_at'])

 def test_existing_generated_id_is_not_an_automatic_verified_crosswalk(self):
  from plan import deterministic
  r=self.package['Import Review'][0];tenant=deterministic(SOURCE_SHA,r['record_id'],'tenant');self.db.execute('INSERT INTO tenant_accounts(id,email,display_name,active) VALUES(?,NULL,?,0)',(tenant,r['tenant_name_proposed']));self.db.commit();self.assertFalse(self.plan()['ready_for_approval'])
