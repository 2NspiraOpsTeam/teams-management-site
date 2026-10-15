import copy, sqlite3, unittest
from reconcile import reconcile, TARGETS
from workbook import digest

class ReconciliationTests(unittest.TestCase):
 def setUp(self):
  self.db=sqlite3.connect(':memory:');self.db.row_factory=sqlite3.Row
  self.db.executescript('CREATE TABLE buildings(id TEXT,name TEXT,publication_state TEXT);CREATE TABLE units(id TEXT,building_id TEXT,unit_identifier TEXT);CREATE TABLE tenant_assignments(id TEXT,tenant_id TEXT,building_id TEXT,unit_id TEXT,active INTEGER);')
  for p in sorted({p for targets in TARGETS.values() for p in targets}):self.db.execute('INSERT INTO buildings VALUES(?,?,?)',(p,p,'draft'))
  aliases=list(TARGETS)
  self.p={'source_sha256':'synthetic-source','workbook_sha256':'synthetic-package','parser_version':'teams-one-time-1',
   'Import Review':[{'record_id':'r'+str(i),'decision':'review','source_customer_raw':'Synthetic '+str(i),'source_sheet':'QA','source_row':i+1,'property_map_key':'m'+str(i%19),'unit_label_proposed':'001A' if i==0 else '', 'review_reasons':''} for i in range(407)],
   'Property Map':[{'property_map_key':'m'+str(i),'source_sheet':'QA','source_property_alias':aliases[i%len(aliases)],'decision':'review'} for i in range(19)],
   'Contacts':[], 'Source Cells':[{'source_sheet':'QA','source_cell':'C'+str(i+1),'source_value_raw':'synthetic'} for i in range(1510)]}
  for i in range(959):self.p['Contacts'].append({'record_id':'r'+str(i%407),'source_sheet':'QA','source_cell':'C'+str(i+1),'contact_type':'phone' if i<407 else 'email','contact_value_raw':'synthetic-'+str(i),'decision':'review'})
 def tearDown(self):self.db.close()
 def test_control_totals_do_not_approve_and_source_is_unchanged(self):
  before=copy.deepcopy(self.p);r=reconcile(self.p,self.db);self.assertEqual(r['summary']['candidates'],407);self.assertFalse(r['candidate_approval_enabled']);self.assertEqual(self.p,before)
  h=r.pop('bundle_sha256');self.assertEqual(h,digest(r))
 def test_text_unit_and_existing_assignment_signal(self):
  self.db.execute("INSERT INTO units VALUES('u','real-166-e-118th-st','001A')");self.db.execute("INSERT INTO tenant_assignments VALUES('a','existing','real-166-e-118th-st','u',1)")
  r=reconcile(self.p,self.db);self.assertEqual(r['summary']['existing_assignment_review_rows'],1);self.assertIn('existing_assignment_review',r['records'][0]['flags'])
  self.db.execute("UPDATE units SET unit_identifier='1A'");self.assertEqual(reconcile(self.p,self.db)['summary']['existing_assignment_review_rows'],0)
 def test_internal_whitespace_in_unit_labels_is_not_collapsed(self):
  self.p['Import Review'][0]['unit_label_proposed']='1  A'
  self.db.execute("INSERT INTO units VALUES('u','real-166-e-118th-st','1 A')")
  self.assertEqual(reconcile(self.p,self.db)['records'][0]['unit_proposals'],[])
 def test_approved_input_and_stale_inventory_stop_review_generation(self):
  self.p['Import Review'][0]['decision']='approve'
  with self.assertRaisesRegex(AssertionError,'unapproved'):reconcile(self.p,self.db)
  self.p['Import Review'][0]['decision']='review';self.db.execute('DELETE FROM buildings')
  with self.assertRaisesRegex(AssertionError,'Stale'):reconcile(self.p,self.db)

if __name__=='__main__':unittest.main()
