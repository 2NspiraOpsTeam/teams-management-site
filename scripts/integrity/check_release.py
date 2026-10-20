#!/usr/bin/env python3
"""Bounded, read-only release gate. No cookies, sign-in sends or record mutations.
Run against a candidate, then stable, with the exact expected runtime revision.
Uses Python's maintained standard HTML parser; no scraping dependency/service.
"""
import argparse, json, pathlib, re, sys, urllib.error, urllib.parse, urllib.request
from html.parser import HTMLParser

class Page(HTMLParser):
 def __init__(self,html):
  super().__init__(convert_charrefs=True);self.metas={};self.canonicals=[];self.links=[];self.scripts=[];self.assets=[];self.title='';self.h1=0;self.active=None;self.script='';self.feed(html)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.metas.setdefault(a.get('name',a.get('property','')),[]).append(a.get('content',''))
  if tag=='link' and a.get('rel')=='canonical':self.canonicals.append(a.get('href'))
  if tag=='a':self.links.append(a.get('href',''))
  if tag=='title':self.active='title'
  if tag=='h1':self.h1+=1
  if tag=='script' and a.get('type')=='application/ld+json':self.active='json';self.script=''
  if tag=='script' and a.get('src','').startswith('/_next/'):self.assets.append(a['src'])
  if tag=='link' and a.get('rel')=='stylesheet' and a.get('href','').startswith('/_next/'):self.assets.append(a['href'])
 def handle_data(self,data):
  if self.active=='title':self.title+=data
  if self.active=='json':self.script+=data
 def handle_endtag(self,tag):
  if tag=='title':self.active=None
  if tag=='script' and self.active=='json':self.scripts.append(json.loads(self.script));self.active=None
 def meta(self,key):
  values=self.metas.get(key,[]);assert len(values)==1,f'Expected one {key}, found {len(values)}';return values[0]

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--origin',required=True);p.add_argument('--release',required=True);p.add_argument('--scope',choices=['preview','production'],required=True);p.add_argument('--full',action='store_true');p.add_argument('--output');a=p.parse_args()
 contract=json.loads(pathlib.Path(__file__).with_name('release_contract.json').read_text());origin=a.origin.rstrip('/');canonical=contract['canonical_'+a.scope];count=0;pages=[];seen=set();assets=set()
 def get(path,agent='TeamsReleaseCheck/1.0'):
  nonlocal count
  count+=1;assert count<=85,'Probe budget exhausted'
  request=urllib.request.Request(origin+path,headers={'User-Agent':agent})
  # Refuse redirects (including Access/login redirects); never turn login HTML into a PASS.
  class NoRedirect(urllib.request.HTTPRedirectHandler):
   def redirect_request(self,*args,**kwargs):return None
  try:r=urllib.request.build_opener(NoRedirect).open(request,timeout=25)
  except urllib.error.HTTPError as e:r=e
  with r:
   assert r.headers.get('X-Teams-Release')==a.release,f'{path}: runtime fingerprint mismatch'
   return r.status,r.headers,r.read(2_000_001)
 queue=list(contract['public_paths'] if a.full else ['/', '/about','/properties','/retail','/contact'])
 while queue:
  path=queue.pop(0)
  if path in seen:continue
  assert len(seen)<60,'Public page budget exhausted';seen.add(path)
  status,headers,body=get(path,'TelegramBot' if path=='/' else 'TeamsReleaseCheck/1.0');assert status==200,f'{path}: HTTP {status}';assert len(body)<=2_000_000,'Oversized HTML'
  page=Page(body.decode());assert page.h1==1,f'{path}: expected one H1';assert page.title and page.meta('description'),path
  assert page.meta('og:title')==page.title and page.meta('og:description')==page.meta('description'),f'{path}: social metadata drift'
  assert page.canonicals==[canonical+path],f'{path}: canonical drift'
  assert ('noindex' in page.meta('robots'))==(a.scope=='preview'),f'{path}: indexing scope mismatch'
  for directive in ["base-uri 'self'","object-src 'none'","frame-ancestors 'self'","form-action 'self'"]:assert directive in headers.get('Content-Security-Policy',''),f'{path}: missing CSP {directive}'
  assert headers.get('X-Content-Type-Options')=='nosniff';assert headers.get('X-Frame-Options')=='SAMEORIGIN'
  types=[s.get('@type') for s in page.scripts];assert 'Organization' in types and 'WebSite' in types,f'{path}: missing schema'
  if path=='/':
   assert page.title==contract['home_title'] and page.meta('description')==contract['home_description'],'Approved sharing copy changed'
   assert not any(s in page.title+page.meta('description')+page.meta('og:title') for s in contract['forbidden_home_copy']),'Superseded sharing copy'
   assets.update(page.assets[:6])
  if a.full:
   for link in page.links:
    if re.fullmatch(r'/(properties|retail)/[^/?#]+',link) and link not in seen and link not in queue:queue.append(link)
  pages.append({'path':path,'title':page.title})
 assert len({x['title'] for x in pages})==len(pages),'Duplicate page titles'
 for path in sorted(assets):
  status,headers,body=get(path);assert status==200 and len(body)>0,f'Missing release asset: {path}'
 for path in contract['protected_paths']:
  status,headers,body=get(path);assert status in [401,404],f'{path}: anonymous access status {status}';assert 'no-store' in headers.get('Cache-Control',''),f'{path}: private caching';assert 'noindex' in headers.get('X-Robots-Tag',''),f'{path}: private indexing'
 for path in ['/robots.txt','/sitemap.xml']:
  status,headers,body=get(path);assert status==200,path;text=body.decode()
  if a.scope=='preview':assert ('Disallow: /' in text if path=='/robots.txt' else '<loc>' not in text),'Preview discovery leak'
  else:
   assert ('Disallow: /\n' not in text if path=='/robots.txt' else '<loc>'+canonical in text),'Production discovery blocked'
 result={'scope':a.scope,'release':a.release,'origin':origin,'requests':count,'public_pages':len(pages),'pages':pages,'status':'PASS','limits':'Anonymous read-only checks; authenticated roles and browser behavior are separate gates.'}
 if a.output:pathlib.Path(a.output).write_text(json.dumps(result,indent=2))
 print(json.dumps({k:v for k,v in result.items() if k!='pages'}))
if __name__=='__main__':
 try:main()
 except Exception as error:print('RELEASE GATE FAILED: '+str(error),file=sys.stderr);sys.exit(1)
