import {describe,it,expect,vi} from 'vitest';
vi.mock('@/lib/admin-auth',()=>({adminEnv:()=>({}),requireAdmin:vi.fn()}));
import {normalizeGoogleLeaseLink,normalizeLeaseSharingLink,saveGoogleLeaseLink} from '../src/lib/operations/google-lease-links';
const input={name:'Signed lease.pdf',webUrl:'https://drive.google.com/file/d/qa_file_123456/view?usp=sharing',reviewed:true,idempotencyKey:'12345678-1234-1234-1234-123456789012'};
describe('restricted Google Drive lease references',()=>{
 it('canonicalizes a file link and never stores bytes or tokens',()=>expect(normalizeGoogleLeaseLink({...input,access_token:'not-stored',bytes:'not-stored'})).toEqual({name:input.name,itemId:'qa_file_123456',webUrl:'https://drive.google.com/file/d/qa_file_123456/view'}));
 it('preserves Drive resource keys required by some files',()=>expect(normalizeGoogleLeaseLink({...input,webUrl:input.webUrl+'&resourcekey=0-abc_123'}).webUrl).toBe('https://drive.google.com/file/d/qa_file_123456/view?resourcekey=0-abc_123'));
 it.each(['http://drive.google.com/file/d/qa_file_123456/view','https://drive.google.com.evil.test/file/d/qa_file_123456/view','https://user@drive.google.com/file/d/qa_file_123456/view','https://drive.google.com/drive/folders/qa_file_123456','javascript:alert(1)','https://drive.google.com/file/d/qa_file_123456/view?access_token=secret','https://drive.google.com/file/d/qa_file_123456/view#secret','https://drive.google.com/file/d/qa_file_123456/view?resourcekey=a&resourcekey=b'])('rejects unsafe or non-file links %s',webUrl=>expect(()=>normalizeGoogleLeaseLink({...input,webUrl})).toThrow());
 it('requires explicit PDF and sharing review',()=>{expect(()=>normalizeGoogleLeaseLink({...input,reviewed:false})).toThrow();expect(()=>normalizeGoogleLeaseLink({...input,name:''})).toThrow();});
 it('stores metadata and audit atomically and scopes identity to the lease',async()=>{const statements:any[]=[];const db={prepare:vi.fn((sql:string)=>({bind:(...args:any[])=>{const s={sql,args,first:async()=>sql.startsWith('SELECT *')?{id:'qa-lease'}:null};statements.push(s);return s;}})),batch:vi.fn(async()=>[])};await saveGoogleLeaseLink({db:db as any,email:'qa@example.test'},'qa-lease',input);expect(db.batch).toHaveBeenCalledTimes(1);const insert=statements.find(s=>s.sql.startsWith('INSERT INTO operations_lease_links'));expect(insert.args).toEqual([input.idempotencyKey,'qa-lease','google-drive','qa_file_123456','Signed lease.pdf','https://drive.google.com/file/d/qa_file_123456/view','qa@example.test']);expect(statements.find(s=>s.sql.startsWith('INSERT INTO audit_log')).args.join(' ')).not.toContain('https://');});
 it('returns an existing association without duplicate writes',async()=>{const db={prepare:(sql:string)=>({bind:()=>({first:async()=>sql.startsWith('SELECT *')?{id:'qa-lease'}:{id:'existing-link'}})}),batch:vi.fn()};expect(await saveGoogleLeaseLink({db:db as any,email:'qa@example.test'},'qa-lease',input)).toEqual({id:'existing-link',duplicate:true});expect(db.batch).not.toHaveBeenCalled();});
});

describe('provider-neutral PDF sharing links',()=>{
 it.each(['https://1drv.ms/b/s!qa_123?e=abc','https://1drv.ms/b/c/123abc/QAfile?e=abc','https://onedrive.live.com/?cid=ABC&resid=ABC!123&authkey=!QA','https://example-my.sharepoint.com/:b:/g/personal/qa_example_com/EXample?e=abc','https://example.sharepoint.com/:b:/s/Leases/EXample?e=abc'])('accepts Microsoft file sharing link %s',webUrl=>{expect(normalizeLeaseSharingLink({...input,webUrl})).toMatchObject({provider:'microsoft-sharing',name:input.name});});
 it.each(['javascript:alert(1)','https://user:pass@example.com/lease','http://1drv.ms/b/qa'])('rejects unsafe links %s',webUrl=>expect(()=>normalizeLeaseSharingLink({...input,webUrl})).toThrow());
 it.each(['https://example.com/shared/lease?token=example#document','https://1drv.ms/u/s!qa?e=abc','https://example.sharepoint.com/sites/Leases'])('accepts secure shared URLs without provider or file-pattern restrictions %s',webUrl=>expect(normalizeLeaseSharingLink({...input,webUrl}).webUrl).toBe(webUrl));
 it('requires review for Microsoft too',()=>expect(()=>normalizeLeaseSharingLink({...input,webUrl:'https://1drv.ms/b/qa',reviewed:false})).toThrow());
 it('stores Microsoft metadata and audit without exposing the sharing URL in audit',async()=>{const statements:any[]=[];const db={prepare:(sql:string)=>({bind:(...args:any[])=>{const s={sql,args,first:async()=>sql.startsWith('SELECT *')?{id:'qa-lease'}:null};statements.push(s);return s;}}),batch:vi.fn(async()=>[])};await saveGoogleLeaseLink({db:db as any,email:'qa@example.test'},'qa-lease',{...input,webUrl:'https://1drv.ms/b/s!qa?e=abc'});expect(statements.find(s=>s.sql.startsWith('INSERT INTO operations_lease_links')).args[2]).toBe('microsoft-sharing');expect(statements.find(s=>s.sql.startsWith('INSERT INTO audit_log')).args.join(' ')).not.toContain('https://');expect(db.batch).toHaveBeenCalledTimes(1);});
});

it.each(['https://1drv.ms/b/s!qa_123?e=abc','https://example-my.sharepoint.com/:b:/g/personal/qa_example_com/EXample?e=abc',input.webUrl])('accepts extensionless shared URL and document label %s',webUrl=>expect(normalizeLeaseSharingLink({...input,name:'Signed lease',webUrl}).name).toBe('Signed lease'));

describe('remove saved lease link',()=>{
 it('scopes removal to the lease and atomically audits without the shared URL',async()=>{
  const {removeLeaseLink}=await import('../src/lib/operations/google-lease-links');const statements:any[]=[];
  const db={prepare:(sql:string)=>({bind:(...args:any[])=>{const s={sql,args,first:async()=>sql.startsWith('SELECT *')?{id:'qa-lease'}:{id:'qa-link',file_name:'Test lease'}};statements.push(s);return s;}}),batch:vi.fn(async()=>[])};
  expect(await removeLeaseLink({db:db as any,email:'qa@example.test'},'qa-lease','qa-link')).toEqual({removed:true});
  expect(statements.find(s=>s.sql.startsWith('DELETE')).args).toEqual(['qa-lease','qa-link']);expect(db.batch).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({sql:expect.stringContaining('DELETE FROM operations_lease_links')}),expect.objectContaining({sql:expect.stringContaining('INSERT INTO audit_log')})]));
  expect(statements.find(s=>s.sql.startsWith('INSERT INTO audit_log')).args.join(' ')).not.toContain('https://');
 });
 it('makes retries of an already removed or unrelated link a no-op',async()=>{
  const {removeLeaseLink}=await import('../src/lib/operations/google-lease-links');const db={prepare:(sql:string)=>({bind:()=>({first:async()=>sql.startsWith('SELECT *')?{id:'qa-lease'}:null})}),batch:vi.fn()};
  expect(await removeLeaseLink({db:db as any,email:'qa@example.test'},'qa-lease','unrelated')).toEqual({removed:true});expect(db.batch).not.toHaveBeenCalled();
 });
 it('reports a transaction failure instead of confirming removal',async()=>{
  const {removeLeaseLink}=await import('../src/lib/operations/google-lease-links');const db={prepare:(sql:string)=>({bind:()=>({first:async()=>({id:'qa-link',file_name:'Test lease'})})}),batch:vi.fn(async()=>{throw Error('backend down');})};
  await expect(removeLeaseLink({db:db as any,email:'qa@example.test'},'qa-lease','qa-link')).rejects.toThrow('Reload before retrying');
 });
});

it('removes only the selected metadata row in SQLite, preserves lease and rolls back on audit failure',async()=>{
 const {DatabaseSync}=await import('node:sqlite');const {removeLeaseLink}=await import('../src/lib/operations/google-lease-links');const sql=new DatabaseSync(':memory:');
 sql.exec("CREATE TABLE operations_leases(id TEXT PRIMARY KEY);INSERT INTO operations_leases VALUES('qa-lease');CREATE TABLE operations_lease_links(id TEXT PRIMARY KEY,lease_id TEXT,file_name TEXT);INSERT INTO operations_lease_links VALUES('qa-test','qa-lease','Test'),('qa-keep','qa-lease','Keep');CREATE TABLE audit_log(id TEXT,action TEXT,entity_type TEXT,entity_id TEXT,record_before_json TEXT,record_after_json TEXT,user_actor TEXT);");
 let rejectAudit=true;const db={prepare:(query:string)=>({bind:(...args:any[])=>({query,args,first:async()=>sql.prepare(query).get(...args)??null})}),batch:async(statements:any[])=>{sql.exec('BEGIN');try{for(const s of statements){if(rejectAudit&&s.query.startsWith('INSERT INTO audit_log'))throw Error('QA audit failure');sql.prepare(s.query).run(...s.args);}sql.exec('COMMIT');return [];}catch(e){sql.exec('ROLLBACK');throw e;}}};const actor={db:db as any,email:'qa@example.test'};
 await expect(removeLeaseLink(actor,'qa-lease','qa-test')).rejects.toThrow();expect(sql.prepare('SELECT count(*) AS n FROM operations_lease_links').get()?.n).toBe(2);rejectAudit=false;
 await removeLeaseLink(actor,'qa-lease','qa-test');await removeLeaseLink(actor,'qa-lease','qa-test');expect(sql.prepare('SELECT id FROM operations_lease_links').all()).toEqual([expect.objectContaining({id:'qa-keep'})]);expect(sql.prepare('SELECT count(*) AS n FROM operations_leases').get()?.n).toBe(1);expect(sql.prepare('SELECT count(*) AS n FROM audit_log').get()?.n).toBe(1);sql.close();
});
