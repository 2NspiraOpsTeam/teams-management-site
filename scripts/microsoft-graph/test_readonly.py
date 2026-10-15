import importlib.util, pathlib, unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('probe',pathlib.Path(__file__).with_name('check-workbook.py'))
probe=importlib.util.module_from_spec(spec);spec.loader.exec_module(probe)
class ReadOnlyProbe(unittest.TestCase):
    def test_change_signals(self):
        self.assertTrue(probe.changed(None,{'id':'i','eTag':'1'}))
        self.assertFalse(probe.changed({'id':'i','eTag':'1'},{'id':'i','eTag':'1'}))
        self.assertTrue(probe.changed({'id':'i','eTag':'1'},{'id':'i','eTag':'2'}))
    def test_no_credentials_no_network(self):
        with patch.object(probe.urllib.request,'build_opener') as network:
            with self.assertRaises(ValueError):probe.workbook_metadata('d','i','')
            network.assert_not_called()
    def test_exact_graph_get_no_redirect(self):
        import io
        class Opener:
            def open(self,request,timeout):
                self.request=request
                return io.BytesIO(b'{"id":"i","name":"source.xlsx","file":{},"eTag":"e"}')
        # Real Graph file facet can be empty; file key existence is sufficient.
        opener=Opener()
        with patch.object(probe.urllib.request,'build_opener',return_value=opener):
            result=probe.workbook_metadata('drive/id','item/id','synthetic-token')
        self.assertEqual(opener.request.get_method(),'GET')
        self.assertTrue(opener.request.full_url.startswith('https://graph.microsoft.com/v1.0/drives/drive%2Fid/items/item%2Fid?'))
        self.assertEqual(result['eTag'],'e')
        self.assertNotIn('Authorization',result)
if __name__=='__main__':unittest.main()
