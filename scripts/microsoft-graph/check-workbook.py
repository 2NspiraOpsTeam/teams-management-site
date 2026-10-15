"""Manual read-only Graph metadata probe. No scheduler, imports, or token storage.
Use an existing delegated Files.Read token; authorization is provisioned separately.
"""
import argparse, json, os, urllib.request, urllib.parse

def workbook_metadata(drive_id, item_id, token):
    if not drive_id or not item_id or not token:
        raise ValueError('Exact drive/item IDs and a delegated read-only token are required')
    quote = lambda v: urllib.parse.quote(v, safe='')
    url = 'https://graph.microsoft.com/v1.0/drives/'+quote(drive_id)+'/items/'+quote(item_id)+'?$select=id,name,eTag,cTag,lastModifiedDateTime,size,file'
    request = urllib.request.Request(url, headers={'Authorization':'Bearer '+token}, method='GET')
    # Never follow redirects with a bearer credential.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs): return None
    with urllib.request.build_opener(NoRedirect).open(request, timeout=30) as response:
        data = json.load(response)
    if 'file' not in data or not str(data.get('name','')).lower().endswith('.xlsx'):
        raise ValueError('Selected item is not an Excel workbook')
    return {k:data.get(k) for k in ('id','name','eTag','cTag','lastModifiedDateTime','size')}

def changed(previous, observed):
    # Metadata is a change signal, not evidence of approved content or source authority.
    return not previous or any(previous.get(k)!=observed.get(k) for k in ('id','eTag','cTag'))

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--drive-id',required=True);parser.add_argument('--item-id',required=True)
    parser.add_argument('--previous',help='Private prior metadata JSON; never modified')
    args=parser.parse_args()
    try:
        observed=workbook_metadata(args.drive_id,args.item_id,os.environ.get('TEAMS_GRAPH_READ_TOKEN',''))
        previous=json.load(open(args.previous)) if args.previous else None
        if previous and 'metadata' in previous: previous=previous['metadata']
        print(json.dumps({'metadata':observed,'change_detected':changed(previous,observed),'action':'review_only','import_enabled':False}))
    except Exception:
        raise SystemExit('Read-only workbook check failed. Check source IDs, delegated Files.Read consent and access; no import attempted.')
