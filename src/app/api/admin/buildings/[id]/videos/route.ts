import { boundedBody, BodyTooLarge } from '@/lib/request-body';
import { NextResponse } from 'next/server';
import { audit,requireAdmin,sameOrigin,unauthorized } from '@/lib/admin-auth';
import { parseVideoInput } from '@/lib/property-video-input';
import { propertyVideos } from '@/lib/property-videos';
export const runtime='nodejs';
type Context={params:Promise<{id:string}>};
export async function GET(_:Request,{params}:Context){const admin=await requireAdmin();if(!admin)return unauthorized();const {id}=await params;return NextResponse.json(await propertyVideos(admin.db,id),{headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request,context:Context){return save(request,context,false);}
export async function PATCH(request:Request,context:Context){return save(request,context,true);}
async function save(request:Request,{params}:Context,updating:boolean){
 const admin=await requireAdmin();if(!admin||!sameOrigin(request))return unauthorized();const {id}=await params;
 let raw:string;try{raw=new TextDecoder().decode(await boundedBody(request,16000));}catch(error){return NextResponse.json({error:'Video details are too long or invalid.'},{status:error instanceof BodyTooLarge?413:400});}
 let body:Record<string,unknown>;try{body=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid video details.'},{status:400});}
 const input=parseVideoInput(body);if(!input)return NextResponse.json({error:'Enter a Google Drive video link and title. Publishing requires confirmation that playback works when signed out.'},{status:400});
 if(!await admin.db.prepare('SELECT id FROM buildings WHERE id=?').bind(id).first())return NextResponse.json({error:'Property not found.'},{status:404});
 if(input.unit_id&&!await admin.db.prepare('SELECT id FROM units WHERE id=? AND building_id=?').bind(input.unit_id,id).first())return NextResponse.json({error:'Choose an apartment in this property.'},{status:400});
 if(input.poster_asset_id){const poster=await admin.db.prepare("SELECT a.visibility,CASE WHEN EXISTS (SELECT 1 FROM media_assignments mp JOIN media_publications pp ON pp.assignment_id=mp.id AND pp.published=1 WHERE mp.asset_id=a.id AND mp.building_id=? AND (mp.unit_id IS NULL OR mp.unit_id IS ?)) THEN 1 ELSE 0 END AS approved FROM media_assets a WHERE a.id=? AND a.file_type LIKE 'image/%' AND a.visibility!='archived' AND EXISTS (SELECT 1 FROM media_assignments m WHERE m.asset_id=a.id AND m.building_id=? AND (m.unit_id IS NULL OR m.unit_id IS ?))").bind(id,input.unit_id,input.poster_asset_id,id,input.unit_id).first<{visibility:string;approved:number}>();if(!poster||input.published&&(poster.visibility!=='public'||poster.approved!==1))return NextResponse.json({error:'Choose a photo assigned to this property and apartment. A published poster must be public eligible with an approved property or apartment assignment.'},{status:400});}
 const existing=updating&&typeof body.id==='string'?await admin.db.prepare('SELECT * FROM property_videos WHERE id=? AND building_id=?').bind(body.id,id).first():null;
 if(updating&&!existing)return NextResponse.json({error:'Video not found.'},{status:404});
 const videoId=existing?.id as string||crypto.randomUUID();
 const values=[input.unit_id,input.source_url,input.title,input.description,input.transcript,input.poster_asset_id,input.published?1:0,input.public_access_verified?1:0,input.order_index];
 try{if(updating)await admin.db.prepare("UPDATE property_videos SET unit_id=?,source_url=?,title=?,description=?,transcript=?,poster_asset_id=?,published=?,public_access_verified=?,order_index=?,updated_at=datetime('now') WHERE id=? AND building_id=?").bind(...values,videoId,id).run();else await admin.db.prepare('INSERT INTO property_videos(unit_id,source_url,title,description,transcript,poster_asset_id,published,public_access_verified,order_index,id,building_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(...values,videoId,id).run();}
 catch(error){if(String(error).includes('UNIQUE'))return NextResponse.json({error:'This video is already in this property’s library. Edit its existing entry.'},{status:409});throw error;}
 await audit(admin.db,admin.email,updating?'updated':'created','property_video',videoId,existing,{...input,building_id:id});return NextResponse.json({id:videoId},{status:updating?200:201});
}
