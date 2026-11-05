import {expect,it} from 'vitest';
import {contactsFor,contactUpdate} from '../src/components/operations/inline-contacts';
const phone={id:'p1',contact_type:'phone',value_raw:'Judith: 212-555-0100; ext 4',label:'daughter',is_primary:1,revision:1};
const email={id:'e1',contact_type:'email',value_raw:'qa@example.test',label:'home',is_primary:1,revision:1};
const current=()=>({id:'t1',email:'login@example.test',display_name:'QA Tenant',active:1,revision:5,internal_notes:'Retain',contacts:[phone,email]});
it('keeps each stored contact intact, including labels and punctuation, and supports legacy/empty phones',()=>{
 expect(contactsFor({contacts_json:JSON.stringify([phone,email])},'phone')).toEqual([phone]);
 expect(contactsFor({phone:'Daughter: 212-555-0101; office 212-555-0102'},'phone')).toHaveLength(1);
 expect(contactsFor({},'email')).toEqual([]);
});
it('merges only the edited contact kind into freshly read details, preserving login, access, notes and other contacts',()=>{
 const latest=current();latest.contacts[1]={...email,value_raw:'newer@example.test',revision:2};
 const result=contactUpdate(latest,'phone',[phone],[{...phone,value_raw:'212-555-0199'}]);
 expect(result).toMatchObject({revision:5});expect(result).not.toHaveProperty('internal_notes');expect(result).not.toHaveProperty('email');expect(result).not.toHaveProperty('active');
 expect(result.contacts).toEqual([latest.contacts[1],{...phone,value_raw:'212-555-0199'}]);
});
it('refuses to overwrite a changed, added or removed contact of the edited kind',()=>{
 for(const contacts of [[{...phone,value_raw:'212-555-0188'},email],[phone,{...phone,id:'p2'},email],[email]])expect(()=>contactUpdate({...current(),contacts},'phone',[phone],[{...phone,value_raw:'212-555-0199'}])).toThrow('changed');
});
it('uses fresh revisions after another cell save without falsely rejecting unchanged contacts',()=>{
 const result=contactUpdate({...current(),contacts:[{...phone,revision:2},email]},'phone',[phone],[{...phone,value_raw:'212-555-0199'}]);
 expect(result.contacts[1].revision).toBe(2);
});
it('supports adding, clearing and partial drafts without rewriting the other contact kind',()=>{
 const added=contactUpdate({...current(),contacts:[email]},'phone',[],[{contact_type:'phone',value_raw:'212-555-0199',label:'unknown',is_primary:0},{contact_type:'phone',value_raw:'  '}]);
 expect(added.contacts).toHaveLength(2);
 expect(contactUpdate(current(),'phone',[phone],[{...phone,value_raw:''}]).contacts).toEqual([email]);
});

it('preserves a legacy phone when adding an email without existing contact records',()=>{
 const result=contactUpdate({...current(),phone:'Office: 212-555-0100',contacts:[]},'email',[],[{contact_type:'email',value_raw:'new@example.test'}]);
 expect(result.contacts).toEqual(expect.arrayContaining([expect.objectContaining({contact_type:'phone',value_raw:'Office: 212-555-0100'})]));
});
