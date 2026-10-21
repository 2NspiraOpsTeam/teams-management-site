'use client';
import {photoAttributes} from '@/lib/photo-variants';
import {useEffect,useState,type ImgHTMLAttributes} from 'react';
const failedSources=new Set<string|Blob>();

// Keep visited image nodes (including failures) mounted. Cycling back to a
// no-store publication-check URL must not retry it indefinitely. Page refresh
// still rechecks publication; no public/private server cache is introduced.
export function RetainedGalleryPhoto({active,...props}:ImgHTMLAttributes<HTMLImageElement>&{active:boolean}) {
 const [visited,setVisited]=useState(active),[failed,setFailed]=useState(false);
 useEffect(()=>{if(active)setVisited(true);},[active]);
 if(!active&&!visited)return null;
 const delivered=typeof props.src==='string'?photoAttributes(props.src,props.sizes):{src:props.src,srcSet:undefined};
 const unavailable=failed||failedSources.has(props.src||'');
 return <img {...props} {...delivered} src={unavailable?undefined:delivered.src} srcSet={unavailable?undefined:(props.srcSet||delivered.srcSet)} onError={event=>{if(props.src){if(failedSources.size>=500)failedSources.clear();failedSources.add(props.src);}setFailed(true);props.onError?.(event);}} hidden={!active} className={`${props.className||''}${active?'':' hidden'}`} />;
}
