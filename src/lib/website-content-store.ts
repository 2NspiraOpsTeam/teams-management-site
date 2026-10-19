import type { D1Database } from '@cloudflare/workers-types';
import { ContentValidationError, contentPage, defaultContent, validateContent, type ContentValues } from './website-content';
export type ContentRow = { page_id:string; revision:string; draft_json:string; published_json:string; previous_json:string|null; published_at:string|null; updated_at:string; updated_by:string };
export async function readContent(db:D1Database,id:string) {
  const row=await db.prepare('SELECT * FROM website_content WHERE page_id=?').bind(id).first<ContentRow>();
  return {page:id,revision:row?.revision??null,draft:row?JSON.parse(row.draft_json) as ContentValues:defaultContent(id),published:row?JSON.parse(row.published_json) as ContentValues:defaultContent(id),previous:row?.previous_json?JSON.parse(row.previous_json) as ContentValues:null,publishedAt:row?.published_at??null,updatedAt:row?.updated_at??null,updatedBy:row?.updated_by??null};
}
export class ContentConflict extends Error {}
export async function mutateContent(db:D1Database,id:string,actor:string,input:{action:unknown;revision:unknown;operationId:unknown;values?:unknown;approved?:unknown}) {
  if(!contentPage(id))throw new ContentValidationError('Unknown website page.');
  if(!['save','restore'].includes(String(input.action)) || typeof input.operationId!=='string' || !/^[0-9a-f-]{36}$/i.test(input.operationId) || !(input.revision===null || typeof input.revision==='string'))throw new ContentValidationError('Invalid content request. Reload and try again.');
  const current=await readContent(db,id);
  if(current.revision===input.operationId)return current; // Safe retry after a response was lost.
  if(current.revision!==input.revision)throw new ContentConflict('Another admin changed this page. Reload the latest version before continuing. Your unsaved text is still shown.');
  if(input.action==='restore'&&input.approved!==true)throw new ContentValidationError('Review and approve the wording before publishing.');
  const draft=input.action==='save'?validateContent(id,input.values):input.action==='restore'?current.previous:current.draft;
  if(!draft)throw new ContentValidationError('There is no previous published version to restore.');
  validateContent(id,draft);
  const publishing=true;
  const published=publishing?draft:current.published;
  const previous=publishing?current.published:current.previous;
  const revision=input.operationId;
  const params=[revision,JSON.stringify(draft),JSON.stringify(published),previous?JSON.stringify(previous):null,actor,publishing?1:0,id,current.revision];
  const change=current.revision===null?
    db.prepare("INSERT OR IGNORE INTO website_content(page_id,revision,draft_json,published_json,previous_json,updated_by,published_at) VALUES(?,?,?,?,?,?,CASE WHEN ? THEN datetime('now') ELSE NULL END)").bind(id,revision,JSON.stringify(draft),JSON.stringify(published),previous?JSON.stringify(previous):null,actor,publishing?1:0):
    db.prepare("UPDATE website_content SET revision=?,draft_json=?,published_json=?,previous_json=?,updated_by=?,updated_at=datetime('now'),published_at=CASE WHEN ? THEN datetime('now') ELSE published_at END WHERE page_id=? AND revision=?").bind(...params);
  const audit=db.prepare("INSERT INTO audit_log(id,action,entity_type,entity_id,record_before_json,record_after_json,user_actor) SELECT ?,?,'website_content',?,?,?,? WHERE EXISTS(SELECT 1 FROM website_content WHERE page_id=? AND revision=?)").bind(revision,`website_content_${input.action}`,id,JSON.stringify(current),JSON.stringify({draft,published,previous}),actor,id,revision);
  const results=await db.batch([change,audit]);
  if(!results[0].meta.changes)throw new ContentConflict('Another admin changed this page. Reload the latest version before continuing.');
  return readContent(db,id);
}
export async function publishedWebsiteContent(db:D1Database):Promise<ContentValues> {
  try {
    const rows=await db.prepare('SELECT page_id,published_json FROM website_content').all<{page_id:string;published_json:string}>();
    return Object.assign({},...rows.results.filter(row=>contentPage(row.page_id)).map(row=>JSON.parse(row.published_json)));
  } catch(error) {
    // A staged build remains identical to the approved site before the additive migration.
    if(error instanceof Error && /no such table.*website_content/.test(error.message))return {};
    throw error;
  }
}
