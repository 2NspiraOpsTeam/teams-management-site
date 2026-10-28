export function driveVideoId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com' || url.username || url.password || url.port) return null;
    const id = url.pathname.match(/^\/file\/d\/([\w-]{10,100})(?:\/view|\/preview)?\/?$/)?.[1];
    return id || null;
  } catch { return null; }
}
export type VideoInput = { source_url:string; title:string; description:string; unit_id:string|null; poster_asset_id:string|null; transcript:string; published:boolean; order_index:number; public_access_verified:boolean };
export function parseVideoInput(value:unknown): VideoInput | null {
  if (!value || typeof value !== 'object') return null;
  const v=value as Record<string,unknown>;
  const id=driveVideoId(v.source_url);
  if (!id || typeof v.title!=='string' || !v.title.trim() || v.title.length>160 || typeof v.description!=='string' || v.description.length>1000 || typeof v.transcript!=='string' || v.transcript.length>12000 || typeof v.published!=='boolean' || typeof v.public_access_verified!=='boolean' || !Number.isInteger(v.order_index) || (v.order_index as number)<0 || (v.order_index as number)>1000) return null;
  if (v.unit_id!==null && (typeof v.unit_id!=='string'||!v.unit_id||v.unit_id.length>160)) return null;
  if (v.poster_asset_id!==null && (typeof v.poster_asset_id!=='string'||!v.poster_asset_id||v.poster_asset_id.length>160)) return null;
  if (v.published && !v.public_access_verified) return null;
  return {source_url:`https://drive.google.com/file/d/${id}/view`,title:v.title.trim(),description:v.description.trim(),transcript:v.transcript.trim(),unit_id:v.unit_id as string|null,poster_asset_id:v.poster_asset_id as string|null,published:v.published,order_index:v.order_index as number,public_access_verified:v.public_access_verified};
}
