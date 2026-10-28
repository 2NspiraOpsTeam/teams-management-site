"""Release attribution across application, edge assets and rejection-only guards."""
import pathlib
import tempfile
import unittest
from check_release import verify_fingerprint

class ReleaseGateTests(unittest.TestCase):
 def test_wrong_application_revision_is_never_accepted(self):
  with self.assertRaises(AssertionError):
   verify_fingerprint('/',200,{'X-Teams-Release':'old'},b'page','current')
 def test_missing_public_revision_is_never_accepted(self):
  with self.assertRaises(AssertionError):
   verify_fingerprint('/',200,{},b'page','current')
 def test_edge_assets_require_exact_local_bytes(self):
  with tempfile.TemporaryDirectory() as directory:
   asset=pathlib.Path(directory)/'_next/static/chunks/test.js';asset.parent.mkdir(parents=True);asset.write_bytes(b'current')
   verify_fingerprint('/_next/static/chunks/test.js',200,{},b'current','sha',directory)
   with self.assertRaises(AssertionError):
    verify_fingerprint('/_next/static/chunks/test.js',200,{},b'old','sha',directory)
   with self.assertRaises(AssertionError):
    verify_fingerprint('/_next/static/chunks/test.js',200,{},b'current','sha')
 def test_asset_cannot_escape_artifact(self):
  with tempfile.TemporaryDirectory() as directory:
   with self.assertRaises(AssertionError):
    verify_fingerprint('/_next/static/../../../outside',200,{},b'x','sha',directory)
 def test_only_exact_no_store_gateway_denials_can_omit_revision(self):
  headers={'X-Teams-Guard':'anonymous','Cache-Control':'private, no-store','X-Robots-Tag':'noindex'}
  verify_fingerprint('/api/admin/session',401,headers,b'{"error":"Unauthorized"}','sha')
  verify_fingerprint('/api/admin/media',404,headers,b'Not found','sha')
  for path,status,body in [('/api/admin/media',200,b'private'),('/api/tenant/leases',401,b'{"error":"Unauthorized"}'),('/api/admin/session',401,b'<html>login</html>')]:
   with self.assertRaises(AssertionError):verify_fingerprint(path,status,headers,body,'sha')
  with self.assertRaises(AssertionError):verify_fingerprint('/api/admin/session',401,{},b'{"error":"Unauthorized"}','sha')
if __name__=='__main__':unittest.main()
