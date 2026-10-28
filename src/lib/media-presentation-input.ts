export type MediaContext='residential'|'retail';
export const mediaKinds=['exterior','storefront','interior','streetscape','floorplan'] as const;
export type PresentationSettings={cover_asset_id:string|null;fallback_to_property_cover:number;revision:number};
export type GallerySelection={asset_id:string;kind:string};
export type PresentationInput={context:MediaContext;cover_asset_id:string|null;fallback_to_property_cover:boolean;revision:number;gallery:GallerySelection[]};
export function validPresentation(input:unknown):input is PresentationInput {
 if(!input||typeof input!=='object')return false;
 const v=input as PresentationInput;
 return ['residential','retail'].includes(v.context)&&Number.isInteger(v.revision)&&v.revision>=0&&(v.cover_asset_id===null||typeof v.cover_asset_id==='string'&&v.cover_asset_id.length>0)&&typeof v.fallback_to_property_cover==='boolean'&&!(v.context==='residential'&&v.fallback_to_property_cover)&&Array.isArray(v.gallery)&&v.gallery.length<=200&&v.gallery.every(x=>x&&typeof x.asset_id==='string'&&x.asset_id.length>0&&mediaKinds.includes(x.kind as typeof mediaKinds[number]))&&new Set(v.gallery.map(x=>x.asset_id)).size===v.gallery.length;
}
