import type { D1Database,D1PreparedStatement } from '@cloudflare/workers-types';
import { adminEnv, hash, requireAdmin } from '@/lib/admin-auth';
import { boundedBody } from '@/lib/request-body';
import { fail, id, OperationError } from './validation';
export type Row=Record<string,any>;
export type Actor={db:D1Database;email:string};
export function enabled(){return (adminEnv() as unknown as {PROPERTY_OPERATIONS_ENABLED?:string}).PROPERTY_OPERATIONS_ENABLED==='1';}
export async function authorize(request:Request,write=false):Promise<Actor>{const actor=await requireAdmin();if(!actor)fail('Unauthorized',401);if(write&&request.headers.get('origin')!==new URL(request.url).origin)fail('Unauthorized',401);if(!enabled())fail('Not found',404);return actor!;}
export const one=async(db:D1Database,sql:string,...args:any[])=>db.prepare(sql).bind(...args).first<Row>();
export const all=async(db:D1Database,sql:string,...args:any[])=>(await db.prepare(sql).bind(...args).all<Row>()).results;
export const stmt=(db:D1Database,sql:string,...args:any[])=>db.prepare(sql).bind(...args);
export async function body(request:Request):Promise<Row>{try{const bytes=await boundedBody(request,64000);const value=JSON.parse(new TextDecoder().decode(bytes));if(!value||Array.isArray(value)||typeof value!=='object')fail('Invalid request.');return value;}catch(e){if(e instanceof OperationError)throw e;return fail('Invalid or oversized request.');}}
export function page(url:URL){const p=Number(url.searchParams.get('page')||0);if(!Number.isSafeInteger(p)||p<0||p>10000)fail('Invalid page.');return {page:p,limit:50,offset:p*50};}
export function pageResult(rows:Row[],p:number){return {items:rows.slice(0,50),page:p,nextPage:rows.length>50?p+1:null,pageSize:50};}
export function search(url:URL){const raw=(url.searchParams.get('q')||'').trim();if(raw.length>100)fail('Search is too long.');return raw.replace(/[\\%_]/g,'\\$&')+'%';}
export function auditStatement(a:Actor,type:string,entityId:string,before:unknown,after:unknown,action='updated'){return stmt(a.db,'INSERT INTO audit_log(id,action,entity_type,entity_id,record_before_json,record_after_json,user_actor) VALUES(?,?,?,?,?,?,?)',crypto.randomUUID(),action,type,entityId,before?JSON.stringify(before):null,JSON.stringify(after),a.email);}
export async function commit(a:Actor,statements:D1PreparedStatement[]){try{await a.db.batch(statements);}catch{return fail('This record changed or conflicts with an existing record. Reload before retrying.',409);}}
export async function receipt(a:Actor,v:Row,type:string,normalized:unknown){const key=id(v.idempotencyKey);if(!/^[0-9a-f-]{36}$/i.test(key))fail('A valid retry receipt is required.');const fingerprint=await hash(JSON.stringify(normalized));const old=await one(a.db,'SELECT actor,fingerprint,entity_id FROM operations_mutation_receipts WHERE id=?',key);if(old){if(old.actor!==a.email||old.fingerprint!==fingerprint)fail('Retry receipt belongs to a different operation.',409);return {duplicate:true,id:old.entity_id,statement:null};}return {duplicate:false,id:key,statement:stmt(a.db,'INSERT INTO operations_mutation_receipts(id,actor,fingerprint,entity_type,entity_id) VALUES(?,?,?,?,?)',key,a.email,fingerprint,type,key)};}
export function revision(v:Row,before:Row){const expected=Number(v.revision);if(!Number.isInteger(expected)||expected!==Number(before.revision))fail('This record changed. Reload before saving.',409);return expected;}
export async function existing(db:D1Database,table:string,key:string,value:string){const row=await one(db,`SELECT * FROM ${table} WHERE ${key}=?`,id(value));if(!row)fail('Record not found.',404);return row!;}
