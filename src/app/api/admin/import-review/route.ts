import {NextResponse} from 'next/server';
import {requireAdmin,sameOrigin,unauthorized} from '@/lib/admin-auth';
import {appendEvent,validateBundle,validateDraft,type ReviewDraft} from '@/lib/operations/import-review';
export const runtime='nodejs';
const entity='tenant_import_review';
const headers={'Cache-Control':'private, no-store','Vary':'Cookie'};
async function load(db:any){
 const chunks=await db.prepare("SELECT record_after_json FROM audit_log WHERE entity_type=? AND action='bundle_chunk' ORDER BY entity_id").bind(entity).all();
 if(!chunks.results.length)throw Error('Review data is not available yet.');
 const bundle=await validateBundle(JSON.parse(chunks.results.map((r:any)=>JSON.parse(r.record_after_json).text).join('')));
 const rows=await db.prepare("SELECT record_after_json FROM audit_log WHERE entity_type=? AND action='review_decision' AND entity_id >= ? AND entity_id < ? ORDER BY entity_id").bind(entity,bundle.bundle_sha256+':',bundle.bundle_sha256+';').all();
 const events=rows.results.map((r:any)=>JSON.parse(r.record_after_json));
 const draft=validateDraft(bundle,{format:'teams-review-draft-1',bundle_sha256:bundle.bundle_sha256,events});
 return {bundle,draft};
}
export async function GET(){const a=await requireAdmin();if(!a)return unauthorized();try{return NextResponse.json({...await load(a.db),reviewer:a.email},{headers});}catch(e){console.error('Review loading failed', e instanceof Error?e.message:'Unknown');return NextResponse.json({error:'Review data could not be loaded. Please retry.'},{status:503,headers});}}
export async function POST(request:Request){const a=await requireAdmin();if(!a)return unauthorized();if(!sameOrigin(request))return unauthorized();
 try{
 if(Number(request.headers.get('content-length')||0)>12000)return NextResponse.json({error:'Request too large'},{status:413,headers});
 const input=await request.json();const {bundle,draft}=await load(a.db);
 if(input.bundle_sha256!==bundle.bundle_sha256||input.revision!==draft.events.length)return NextResponse.json({error:'Another reviewer saved a decision. Reload the review before saving.'},{status:409,headers});
 const value={outcome:input.value?.outcome,property_id:input.value?.property_id,note:input.value?.note,reviewer:a.email};
 if(!['outcome','property_id','note'].every(k=>typeof value[k as keyof typeof value]==='string'))throw Error('Enter a valid review decision.');
 const next=appendEvent(bundle,draft,input.key,value);
 if(next.events.length===draft.events.length)return NextResponse.json({draft},{headers});
 const event=next.events.at(-1)!;
 // A deterministic primary key is the cross-reviewer compare-and-swap lock.
 const id='review:'+bundle.bundle_sha256+':'+String(event.sequence).padStart(8,'0');
 const result=await a.db.prepare('INSERT OR IGNORE INTO audit_log(id,action,entity_type,entity_id,record_before_json,record_after_json,user_actor) VALUES(?,?,?,?,?,?,?)').bind(id,'review_decision',entity,bundle.bundle_sha256+':'+String(event.sequence).padStart(8,'0'),JSON.stringify(event.before),JSON.stringify(event),a.email).run();
 if(!result.meta.changes)return NextResponse.json({error:'Another reviewer saved a decision. Reload the review before saving.'},{status:409,headers});
 return NextResponse.json({draft:next},{headers});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Decision could not be saved.'},{status:400,headers});}
}
