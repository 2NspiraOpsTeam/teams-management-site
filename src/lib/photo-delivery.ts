import records from './generated/photo-delivery.json';
// The full manifest stays server-side for live authorization and artifact checks.
const photos=records as Record<string,{prefix:string;widths:number[];files?:string[]}>;
const enabled=process.env.NEXT_PUBLIC_PREVIEW_PORTFOLIO==='1'||process.env.NEXT_PUBLIC_PORTFOLIO_PRESENTATION==='1';
const url=(photo:typeof photos[string],index:number)=>photo.prefix+(photo.files?photo.files[index]:photo.widths[index]);
export function photoAttributes(src:string|undefined,sizes='(max-width: 767px) 100vw, (max-width: 1279px) 60vw, 50vw'){
 const photo=enabled&&src?photos[src]:undefined;if(!photo)return {src};
 const index=photo.widths.findIndex(width=>width>=1600);
 return {src:url(photo,index<0?photo.widths.length-1:index),srcSet:photo.widths.map((width,i)=>`${url(photo,i)} ${width}w`).join(', '),sizes};
}
export function highResolutionPhoto(src:string,width=2560){
 const photo=enabled?photos[src]:undefined;if(!photo)return src;
 const index=photo.widths.findIndex(value=>value>=width);
 return url(photo,index<0?photo.widths.length-1:index);
}
