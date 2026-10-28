"""Read-only reconciliation; private review artifacts, never an import manifest."""
import argparse, collections, json, sqlite3
from pathlib import Path
from workbook import digest, report
from cli import private_write

TARGETS = {
 '166 East 118th Street': ['real-166-e-118th-st'],
 '170 East 118th Street': ['real-170-e-118th-st'],
 '225 East 83rd': ['real-225-e-83rd-st'], '1626': ['real-1626-2nd-ave'],
 '171 E 74 Commercial': ['real-171-e-74th-st'], '171 E 74 Residential': ['real-171-e-74th-st'],
 '1365 1st Avenue': ['real-1365-1st-ave'], '71 East 110th Street': ['build-004'],
 '235 West 18th': ['real-235-w-18th-st'],
 '349/351 West 46th Street': ['real-349-w-46th-st','real-351-w-46th-st'],
 'NOVITA LLC — address unconfirmed': [], '1374 First Avenue': ['real-1374-1st-ave'],
 '42-70 156th St.': ['build-001'], '41 West 46th Street': ['real-41-w-46th-st'],
 '3425 E Tremont Lower Level': ['build-002'], '3421-31 E TREMONT AVE.': ['build-002'],
 'BRUCKNER BLVD.': []
}

def norm(v): return ' '.join(str(v).split()).casefold()

def reconcile(p, db):
 summary=report(p)
 assert summary['candidate_decisions']=={'review':407}, 'Keep all candidates unapproved'
 properties=[dict(r) for r in db.execute('SELECT id,name,publication_state FROM buildings')]
 byid={r['id']:r for r in properties}
 units=[dict(r) for r in db.execute('SELECT id,building_id,unit_identifier FROM units')]
 assignments=[dict(r) for r in db.execute('SELECT id,tenant_id,building_id,unit_id,active FROM tenant_assignments')]
 contacts=collections.defaultdict(list)
 for c in p['Contacts']: contacts[c['record_id']].append(c)
 aliases=[]
 for a in p['Property Map']:
  targets=TARGETS.get(a['source_property_alias'],[])
  assert all(t in byid for t in targets), 'Stale proposed property ID'
  ambiguous=a['source_property_alias'] in ('1626','349/351 West 46th Street','NOVITA LLC — address unconfirmed','3425 E Tremont Lower Level','3421-31 E TREMONT AVE.','BRUCKNER BLVD.')
  aliases.append({**a,'proposals':[byid[t] for t in targets], 'resolution':'confirmation_required' if ambiguous else 'exact_address_suggestion', 'candidate_count':sum(r['property_map_key']==a['property_map_key'] for r in p['Import Review'])})
 amap={a['property_map_key']:a for a in aliases}
 signatures=collections.defaultdict(list); labels=collections.defaultdict(list); rows=[]
 for r in p['Import Review']:
  cs=contacts[r['record_id']]; sig=(norm(r['source_customer_raw']),tuple(norm(c['contact_value_raw']) for c in cs))
  signatures[sig].append(r['record_id']); labels[norm(r['source_customer_raw'])].append((r['record_id'],sig[1]))
  missing=[t for t in ('email','phone') if not any(c['contact_type']==t and str(c['contact_value_raw']).strip() for c in cs)]
  props=[x['id'] for x in amap[r['property_map_key']]['proposals']]
  exact_units=[u for u in units if u['building_id'] in props and str(u['unit_identifier']).strip().casefold()==str(r['unit_label_proposed']).strip().casefold() and str(r['unit_label_proposed']).strip()]
  links=[a for a in assignments if a['unit_id'] in {u['id'] for u in exact_units}]
  flags=[f.strip() for f in str(r['review_reasons']).split(';') if f.strip()]
  if len(props)>1: flags.append('property_separation_required')
  if not props: flags.append('property_unmapped')
  if links: flags.append('existing_assignment_review')
  rows.append({**r,'contacts':cs,'missing':missing,'flags':sorted(set(flags)), 'unit_proposals':exact_units,'existing_assignments':links})
 repeats=[{'id':'R-'+digest(ids)[:16],'record_ids':ids,'decision':'review'} for ids in signatures.values() if len(ids)>1]
 label_conflicts=[ids for ids in labels.values() if len({v for _,v in ids})>1]
 missing_email=sum('email' in r['missing'] for r in rows);missing_phone=sum('phone' in r['missing'] for r in rows)
 summary.update(missing_email=missing_email,missing_phone=missing_phone,missing_both=sum(len(r['missing'])==2 for r in rows),
  label_conflict_groups=len(label_conflicts),label_conflict_rows=sum(len(g) for g in label_conflicts),
  existing_assignment_review_rows=sum(bool(r['existing_assignments']) for r in rows),
  combined_alias_rows=sum('property_separation_required' in r['flags'] for r in rows),
  novita_rows=sum(r['source_sheet']=='NOVITA LLC' for r in rows))
 payload={'format':'teams-import-review-1','summary':summary,'properties':properties,'aliases':aliases,'records':rows,'repeat_groups':repeats,
  'label_conflicts':[[i for i,_ in g] for g in label_conflicts],
  'source_archive':p['Source Cells'],'baseline_sha256':digest(p),'inventory_sha256':digest({'properties':properties,'units':units,'assignments':assignments}),
  'candidate_approval_enabled':False,'import_enabled':False}
 return {**payload,'bundle_sha256':digest(payload)}

if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--baseline',required=True);a.add_argument('--database',required=True);a.add_argument('--output',required=True);v=a.parse_args()
 db=sqlite3.connect(Path(v.database).resolve().as_uri()+'?mode=ro',uri=True);db.row_factory=sqlite3.Row
 result=reconcile(json.loads(Path(v.baseline).read_text()),db);db.close();private_write(v.output,result);print(json.dumps(result['summary']))
