import records from './generated/photo-variants.json';
export type PhotoVariant={width:number;height:number;bytes:number;file:string;sha256:string};
export type PreparedPhoto={kind:string;id:string;originalSrc:string;storageKey?:string;assetChecksum?:string|null;sourceSha256:string;originalWidth:number;originalHeight:number;originalBytes:number;upscaled:boolean;cover:boolean;variants:PhotoVariant[]};
const photos=records as PreparedPhoto[];
const bySource=new Map(photos.map(photo=>[photo.originalSrc,photo]));
const byId=new Map(photos.filter(photo=>photo.kind==='media').map(photo=>[photo.id,photo]));
const enabled=process.env.NEXT_PUBLIC_PREVIEW_PORTFOLIO==='1';
export function variantUrl(photo:PreparedPhoto,variant:PhotoVariant){return photo.kind==='media'?`/api/media/${encodeURIComponent(photo.id)}?v=${photo.sourceSha256}&w=${variant.width}`:`/photo-variants/${variant.file}`;}
export function preparedPhoto(src:string|undefined){return enabled&&src?bySource.get(src):undefined;}
export function photoAttributes(src:string|undefined,sizes='(max-width: 767px) 100vw, (max-width: 1279px) 60vw, 50vw'){
 const photo=preparedPhoto(src);if(!photo)return {src};
 const fallback=photo.variants.find(v=>v.width>=1600)||photo.variants[photo.variants.length-1];
 return {src:variantUrl(photo,fallback),srcSet:photo.variants.map(v=>`${variantUrl(photo,v)} ${v.width}w`).join(', '),sizes};
}
export function highResolutionPhoto(src:string,width=2560){const photo=preparedPhoto(src);if(!photo)return src;const variant=photo.variants.find(v=>v.width>=width)||photo.variants[photo.variants.length-1];return variantUrl(photo,variant);}
export function requestedMediaVariant(id:string,version:string|null,width:number){
 if(!enabled||!Number.isSafeInteger(width)||width<1)return null;
 const photo=byId.get(id);if(!photo||version!==photo.sourceSha256)return null;
 const variant=photo.variants.find(v=>v.width===width);return variant?{photo,variant}:null;
}
export function variantMatchesSource(photo:PreparedPhoto,asset:{storage_key:string;checksum:string|null}){return photo.kind==='media'&&photo.storageKey===asset.storage_key&&photo.assetChecksum===asset.checksum;}
