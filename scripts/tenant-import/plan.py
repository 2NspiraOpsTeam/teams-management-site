"""Review-to-change manifest against an explicit read-only local inventory snapshot."""
import json,re,uuid
from collections import defaultdict
import phonenumbers
from workbook import digest,require,PARSER_VERSION
TABLES={'tenant_accounts','operations_tenants','units','operations_units','tenant_contacts','tenant_assignments','operations_assignment_profiles'}
KEYS={'operations_tenants':'tenant_id','operations_units':'unit_id','operations_assignment_profiles':'assignment_id'}
def pk(table):return KEYS.get(table,'id')
def row(db,table,entity):
 require(table in TABLES|{'buildings'},'Unsupported entity')
 r=db.execute(f'SELECT * FROM {table} WHERE {pk(table)}=?',(entity,)).fetchone();return dict(r) if r else None
def deterministic(*parts):return str(uuid.uuid5(uuid.NAMESPACE_URL,'teams-import:'+':'.join(map(str,parts))))
def contact_value(c,correction):
 require(c['contact_type'] in ('phone','email'),'Unknown contact type')
 require(c['validation_state'] in ('unreviewed','syntax_valid','invalid','syntax_only','country_confirmation_required','review'),'Import may not verify contacts')
 require(set(correction)<=set('values label country is_primary reviewer reason'.split()),'Unexpected correction fields')
 if correction:require(correction.get('reviewer') and correction.get('reason'),'Correction needs reviewer/evidence')
 values=correction.get('values',[c['contact_value_raw']]);require(isinstance(values,list) and values and all(isinstance(v,str) and v.strip() for v in values),'Invalid corrected contacts')
 require(c['contact_type']!='email' or all(not re.search(r'[,;\n]',v) for v in values),'Multiple email addresses require reviewed splitting')
 results=[]
 for v in values:
  normalized=None;extension=None;country=correction.get('country',c['country_confirmed']) or None;state='unreviewed'
  if c['contact_type']=='email':
   require(not country,'Country applies only to phones');state='syntax_valid' if re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',v) else 'invalid'
   # Deliberate directory comparison: casefold whole address; raw spelling retained.
   normalized=v.casefold() if state=='syntax_valid' else None
  elif country:
   require(isinstance(country,str) and country in phonenumbers.SUPPORTED_REGIONS,'Country must be confirmed ISO region')
   try:
    phone=phonenumbers.parse(v,country);valid=phonenumbers.is_valid_number(phone)
    state='syntax_valid' if valid else 'invalid';normalized=phonenumbers.format_number(phone,phonenumbers.PhoneNumberFormat.E164) if valid else None;extension=phone.extension
   except phonenumbers.NumberParseException:state='invalid'
  results.append({'contact_type':c['contact_type'],'value_raw':v,'value_normalized':normalized,'extension':extension,'country_code':country,'validation_state':state,'label':correction.get('label','unknown'),'is_primary':int(correction.get('is_primary',False)),'verified_at':None})
 require(len(results)==1 or not correction.get('is_primary'),'Splits need separate role/primary review')
 return results

def make_plan(p,db,staging):
 require(set(staging)<=set('corrections source_cell_review new_units distinct_repeats property_overrides updates additional_candidates'.split()),'Unexpected staging fields')
 parents=list(p['Import Review']);maps={m['property_map_key']:m for m in p['Property Map']};contacts=defaultdict(list)
 for c in p['Contacts']:contacts[c['record_id']].append(c)
 source={(s['source_sheet'],s['source_cell']):s for s in p['Source Cells']};used_cells={(c['source_sheet'],c['source_cell']) for c in p['Contacts']}
 for addition in staging.get('additional_candidates',[]):
  require(set(addition)=={'record','customer_cell','contacts'},'Unexpected additional-candidate fields')
  r=addition['record'];locator=(r['source_sheet'],addition['customer_cell']);require(locator in source,'Additional candidate needs original source coordinate')
  expected='A-'+digest([p['source_sha256'],*locator])[:16]
  require(r['record_id']==expected and not any(x['record_id']==expected for x in parents),'Invalid additional-candidate identity')
  require(str(r['source_customer_raw'])==str(source[locator]['source_value_raw']),'Additional raw customer value changed')
  require(str(r['source_row'])==''.join(c for c in addition['customer_cell'] if c.isdigit()),'Additional source row mismatch')
  require(r['reviewer'] and r['review_note'],'Additional candidate needs documented review evidence')
  for c in addition['contacts']:
   key=(c['source_sheet'],c['source_cell']);require(key in source and c['record_id']==expected,'Invalid additional contact provenance')
   require(key not in used_cells,'Source contact cell already accounted for');used_cells.add(key)
   require(str(c['contact_value_raw'])==str(source[key]['source_value_raw']),'Additional raw contact changed')
   contacts[expected].append(c)
  parents.append(r)

 conflicts=[];items=[];changes=[];planned={};signatures=defaultdict(list);preconditions={};readers={}
 def read(table,entity):
  value=row(db,table,entity);preconditions[(table,entity)]=value;readers.setdefault((table,entity),set()).add(r['record_id']);return value
 def add(table,data):
  k=(table,data[pk(table)]);before=read(table,k[1]);after={**before,**data} if before else data
  if k in planned:require(planned[k]['after']==after,'Conflicting changes to same entity');return
  if before==after:return
  ch={'table':table,'id':k[1],'record_id':r['record_id'],'before':before,'after':after};planned[k]=ch;changes.append(ch)
 def item(r,cell,outcome,tenant=None,unit=None,contact=None):
  items.append({'record_id':r['record_id'],'source_sha256':p['source_sha256'],'source_sheet':r['source_sheet'],'source_row':r['source_row'],'source_cell':cell,'tenant_id':tenant,'unit_id':unit,'contact_id':contact,'outcome':outcome,'review_reason':r['review_note'],'reviewed_by':r['reviewer']})
 for r in parents:
  try:
   require(not db.execute('SELECT 1 FROM tenant_import_items WHERE source_sha256=? AND record_id=? LIMIT 1',(p['source_sha256'],r['record_id'])).fetchone(),'Source record already has provenance; resume the original immutable batch, not a regenerated plan')
   decision=r['decision'];require(decision in ('review','approve','hold','exclude_duplicate','exclude_non_tenant'),'Invalid candidate decision')
   require(isinstance(r['source_row'],int) and r['source_row']>0,'Invalid source row')
   for c in contacts[r['record_id']]:require(c['decision'] in ('review','approve','hold','exclude'),'Invalid contact decision')
   require(all(c['decision']!='approve' or decision=='approve' for c in contacts[r['record_id']]),'Approved contact has unapproved parent')
   if decision!='review':require(r['reviewer'] and r['review_note'],'Decision requires reviewer and evidence')
   if decision!='approve':
    outcome='exclude' if decision.startswith('exclude_') else 'hold';item(r,'@row',outcome)
    for c in contacts[r['record_id']]:item(r,c['source_cell'],outcome)
    continue
   require(r['reviewer'] and r['review_note'],'Approval requires reviewer and evidence')
   require(all(c['decision']!='review' for c in contacts[r['record_id']]),'Contact decisions unresolved')
   m=maps.get(r['property_map_key']);require(m and m['decision']=='approve','Property alias is not approved')
   property_id=r['existing_property_id'];require(property_id and read('buildings',property_id),'Existing property ID required')
   if property_id!=m['existing_property_id']:require(staging.get('property_overrides',{}).get(r['record_id'])=={'property_id':property_id,'reason':r['review_note']},'Combined-address override needs explicit staging evidence')
   label=r['unit_label_proposed'];require(isinstance(label,str) and label.strip(),'Unit label unresolved; identifiers must be text')
   unit=r['existing_unit_id'];newunit=False
   if unit:
    u=read('units',unit);read('operations_units',unit);require(u and u['building_id']==property_id and u['unit_identifier']==label,'Property/unit mismatch')
   else:
    require(r['record_id'] in staging.get('new_units',{}),'New unit needs explicit inventory approval')
    floor=staging['new_units'][r['record_id']].get('floor_number');require(isinstance(floor,int) and not isinstance(floor,bool) and -10<=floor<=300,'Existing inventory requires an explicitly confirmed floor; never infer one')
    require(not db.execute('SELECT id FROM units WHERE building_id=? AND upper(trim(unit_identifier))=?',(property_id,label.strip().upper())).fetchone(),'Existing unit requires verified ID')
    unit=deterministic(p['source_sha256'],'unit',property_id,label.strip().upper());newunit=True
   name=r['tenant_name_proposed'];require(isinstance(name,str) and name.strip(),'Confirmed display name required')
   tenant=r['existing_tenant_id'] or deterministic(p['source_sha256'],r['record_id'],'tenant');t=read('tenant_accounts',tenant)
   if r['existing_tenant_id']:require(t is not None,'Unknown existing tenant ID')
   else:require(t is None,'Generated new tenant ID already exists; verified existing-ID crosswalk required')
   if t:read('operations_tenants',tenant)
   if t and t['display_name']!=name:
    update=staging.get('updates',{}).get(r['record_id']);require(update=={'before':t,'display_name':name,'reason':r['review_note']},'Conflicting existing name needs explicit snapshot/update evidence')
   # Validate all contact corrections before adding this record to the plan.
   resolved=[]
   for c in contacts[r['record_id']]:
    if c['decision']=='approve':resolved.extend((c,v) for v in contact_value(c,staging.get('corrections',{}).get(r['record_id']+':'+c['source_cell'],{})))
   sig=(' '.join(name.split()).casefold(),tuple(' '.join(str(v['value_raw']).split()).casefold() for _,v in resolved));signatures[sig].append(r['record_id'])
   if newunit:add('units',{'id':unit,'building_id':property_id,'unit_identifier':label,'floor_number':floor,'status':'unverified'});add('operations_units',{'unit_id':unit})
   if not t:add('tenant_accounts',{'id':tenant,'email':None,'display_name':name,'active':0});add('operations_tenants',{'tenant_id':tenant})
   elif t['display_name']!=name:add('tenant_accounts',{'id':tenant,'display_name':name});profile=read('operations_tenants',tenant);require(profile is not None,'Existing tenant revision profile required');add('operations_tenants',{'tenant_id':tenant,'revision':profile['revision']+1})
   a=db.execute('SELECT * FROM tenant_assignments WHERE tenant_id=? AND unit_id=?',(tenant,unit)).fetchone()
   if a:read('tenant_assignments',a['id']);read('operations_assignment_profiles',a['id'])
   if not a:
    assignment=deterministic(p['source_sha256'],tenant,unit,'assignment')
    add('tenant_assignments',{'id':assignment,'tenant_id':tenant,'building_id':property_id,'unit_id':unit,'active':0})
    add('operations_assignment_profiles',{'assignment_id':assignment,'assignment_status':'proposed','relationship_type':'unknown'})
   item(r,'@row','update' if t and t['display_name']!=name else 'link' if t else 'create',tenant,unit)
   mapped_cells=defaultdict(list)
   for c,v in resolved:
    match=db.execute('SELECT * FROM tenant_contacts WHERE tenant_id=? AND contact_type=? AND value_raw=? AND archived=0',(tenant,v['contact_type'],v['value_raw'])).fetchone()
    if match:read('tenant_contacts',match['id'])
    contact=match['id'] if match else deterministic(p['source_sha256'],tenant,v['contact_type'],v['value_raw'])
    if not match:add('tenant_contacts',{'id':contact,'tenant_id':tenant,**v})
    mapped_cells[c['source_cell']].append(contact)
   for c in contacts[r['record_id']]:
    # Non-null derived locator retains one source-cell accounting plus split links.
    ids=mapped_cells.get(c['source_cell'],[])
    if ids:
     for n,cid in enumerate(dict.fromkeys(ids)):item(r,c['source_cell'] if n==0 else c['source_cell']+'#'+str(n+1),'link',tenant,unit,cid)
    else:item(r,c['source_cell'],'exclude' if c['decision']=='exclude' else 'hold',tenant,unit)
  except (ValueError,KeyError,TypeError) as e:conflicts.append({'record_id':r['record_id'],'reason':str(e)})
 for group in signatures.values():
  if len(group)>1 and not all(staging.get('distinct_repeats',{}).get(k) for k in group):conflicts.append({'record_ids':group,'reason':'Multiple approved repeat occurrences need distinct-entity evidence'})
 ledger=staging.get('source_cell_review',{})
 known={r['source_sheet']+'!'+r['source_cell'] for r in p['Source Cells']}
 require(set(ledger)<=known,'Unknown source-cell review locator')
 reviewed={k for k,v in ledger.items() if isinstance(v,dict) and set(v)=={'decision','reviewer','reason'} and v['decision'] in ('mapped','note','non_tenant','candidate_reviewed') and v['reviewer'] and v['reason']}
 unresolved=len(known-reviewed)
 pending=sum(r['decision']=='review' for r in parents)+sum(c['decision']=='review' for group in contacts.values() for c in group)
 plan={'source_sha256':p['source_sha256'],'approved_package_sha256':digest({'package':p,'staging':staging}),'parser_version':PARSER_VERSION,'changes':changes,'preconditions':[{'table':k[0],'id':k[1],'row':v,'record_ids':sorted(readers[k])} for k,v in preconditions.items()],'items':items,'conflicts':conflicts,'unresolved_source_cells':unresolved,'unresolved_decisions':pending,'candidate_count':len(parents),'original_candidate_count':len(p['Import Review']),'additional_candidate_count':len(parents)-len(p['Import Review']),'contact_cell_count':sum(len(v) for v in contacts.values())}
 # Check the complete write set against an isolated savepoint: keys, primary contacts,
 # foreign keys and cross-record conflicts must pass before approval can be sealed.
 if not conflicts:
  db.execute('SAVEPOINT import_validation')
  try:
   for c in changes:
    data=c['after'];table=c['table'];key=pk(table)
    if c['before'] is None:db.execute(f"INSERT INTO {table} ({','.join(data)}) VALUES ({','.join('?' for _ in data)})",tuple(data.values()))
    else:db.execute(f"UPDATE {table} SET {','.join(k+'=?' for k in data if k!=key)} WHERE {key}=?",tuple(v for k,v in data.items() if k!=key)+(c['id'],))
   require(not db.execute('PRAGMA foreign_key_check').fetchall(),'Foreign-key reconciliation failed')
  except Exception as e:plan['conflicts'].append({'reason':'Write-set conflict: '+str(e)})
  finally:db.execute('ROLLBACK TO import_validation');db.execute('RELEASE import_validation')
 for record in {i['record_id'] for i in items}:
  statements=4*sum(c['record_id']==record for c in changes)+sum(record in v for v in readers.values())+sum(i['record_id']==record for i in items)+2
  if statements>80:plan['conflicts'].append({'record_id':record,'reason':'Record exceeds bounded atomic statement limit; reviewed split required'})
 plan['ready_for_approval']=not plan['conflicts'] and not unresolved and not pending
 plan['manifest_sha256']=digest(plan)
 return plan
