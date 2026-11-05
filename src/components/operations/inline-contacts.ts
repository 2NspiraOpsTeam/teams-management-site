import type {RecordRow} from './shared';
export type ContactKind='phone'|'email';
export function contactsFor(row:RecordRow,kind:ContactKind):RecordRow[]{
 const contacts:RecordRow[]=Array.isArray(row.contacts)?row.contacts:JSON.parse(row.contacts_json||'[]');
 const selected=contacts.filter(c=>c.contact_type===kind);
 // Legacy phone text is one recorded value, never split on punctuation or labels.
 return selected.length?selected:kind==='phone'&&row.phone?[{contact_type:kind,value_raw:row.phone,label:'unknown',is_primary:1}]:[];
}
const signature=(contacts:RecordRow[])=>JSON.stringify(contacts.map(c=>[c.id||null,c.value_raw,c.label||'unknown',Number(c.is_primary)||0]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));
export function contactUpdate(current:RecordRow,kind:ContactKind,original:RecordRow[],draft:RecordRow[]){
 if(signature(contactsFor(current,kind))!==signature(original))throw Error('These contacts changed since you loaded the list. Your draft is kept. Copy it before cancelling and refreshing this list.');
 const edited=draft.filter(c=>String(c.value_raw).trim()).map(c=>({...c,...(c.id?{revision:current.contacts.find((v:RecordRow)=>v.id===c.id)?.revision}:{}),value_raw:String(c.value_raw).trim()}));
 const contacts=[...contactsFor(current,kind==='phone'?'email':'phone'),...edited];
 if(contacts.length>40)throw Error('Use up to 40 contacts per tenant.');
 return {revision:current.revision,contacts};
}
