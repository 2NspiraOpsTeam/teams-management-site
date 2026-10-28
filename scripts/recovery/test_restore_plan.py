import unittest,tempfile,pathlib,json,hashlib,datetime
from restore_plan import build
TARGETS={'waterbear':{'account_id':'test-development-account','database_id':'test-development-database','worker':'test-development-worker'},'2nspira':{'account_id':'test-production-account','database_id':'test-production-database','worker':'test-production-worker'}}
class RestorePlanSafety(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=pathlib.Path(self.tmp.name);(self.root/'metadata').mkdir();self.now=datetime.datetime.now(datetime.timezone.utc)
  self.manifest={'account_id':TARGETS['waterbear']['account_id'],'database_id':TARGETS['waterbear']['database_id'],'worker':TARGETS['waterbear']['worker'],'created_at_utc':self.now.isoformat(),'exact_bookmark_for_snapshot':'test-bookmark','bookmark_unchanged_during_export':True}
  self.write('metadata/restore-verification.json',{'exact_table_content_match':True,'exact_schema_match':True,'foreign_key_violations':0})
  self.write('metadata/deployments.json',[{'created_on':self.now.isoformat(),'versions':[{'version_id':'approved-version','percentage':100}]}]);(self.root/'database.sql').write_text('CREATE TABLE example(id TEXT PRIMARY KEY);');self.save()
 def tearDown(self):self.tmp.cleanup()
 def write(self,path,value):(self.root/path).write_text(json.dumps(value))
 def save(self):
  self.manifest['files_sha256']={str(p.relative_to(self.root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in self.root.rglob('*') if p.is_file() and p.name!='checkpoint-manifest.json'};self.write('checkpoint-manifest.json',self.manifest)
 def test_valid_checkpoint_has_precise_fast_plan(self):
  plan=build(self.root,'waterbear',TARGETS,self.now);self.assertTrue(plan['fast_path_within_free_plan_retention']);self.assertEqual(plan['database_command'][4],TARGETS['waterbear']['database_id'])
 def test_wrong_account_refused(self):
  with self.assertRaises(AssertionError):build(self.root,'2nspira',TARGETS,self.now)
 def test_corruption_refused(self):
  (self.root/'database.sql').write_text('unexpected change')
  with self.assertRaisesRegex(AssertionError,'Checksum'):build(self.root,'waterbear',TARGETS,self.now)
 def test_expired_bookmark_does_not_get_fast_command(self):
  plan=build(self.root,'waterbear',TARGETS,self.now+datetime.timedelta(days=8));self.assertFalse(plan['fast_path_within_free_plan_retention']);self.assertIsNone(plan['database_command'])
 def test_unaligned_bookmark_requires_portable_restore(self):
  self.manifest['bookmark_unchanged_during_export']=False;self.save();self.assertIsNone(build(self.root,'waterbear',TARGETS,self.now)['database_command'])
 def test_weighted_deployment_is_not_silently_simplified(self):
  self.write('metadata/deployments.json',[{'created_on':self.now.isoformat(),'versions':[{'version_id':'one','percentage':50},{'version_id':'two','percentage':50}]}]);self.save()
  with self.assertRaisesRegex(AssertionError,'Weighted'):build(self.root,'waterbear',TARGETS,self.now)
if __name__=='__main__':unittest.main()
