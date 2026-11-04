'use client';
import {photoAttributes} from '@/lib/photo-delivery';
import {useEffect,useRef,useState,type ImgHTMLAttributes} from 'react';
const failedSources=new Set<string|Blob>();

// Keep visited nodes mounted, but only prepare a bounded adjacent image.
// Failed publication checks are not retried automatically when cycling.
export function RetainedGalleryPhoto({active,preload=false,retry=0,onReady,onFailure,...props}:ImgHTMLAttributes<HTMLImageElement>&{active:boolean;preload?:boolean;retry?:number;onReady?:()=>void;onFailure?:()=>void}) {
 const [visited,setVisited]=useState(active||preload),[failed,setFailed]=useState(false);
 const image=useRef<HTMLImageElement>(null);
 const callbacks=useRef({onReady,onFailure});callbacks.current={onReady,onFailure};
 useEffect(()=>{if(active||preload)setVisited(true);},[active,preload]);
 useEffect(()=>{if(retry){failedSources.delete(props.src||'');setFailed(false);}},[retry,props.src]);
 const ready=()=>{const node=image.current;if(!node?.naturalWidth)return;void node.decode().then(()=>callbacks.current.onReady?.()).catch(()=>callbacks.current.onFailure?.());};
 // Cached photos can finish before hydration attaches the load handler.
 useEffect(()=>{const node=image.current;if(node?.complete){if(node.naturalWidth)ready();else if(node.currentSrc)callbacks.current.onFailure?.();}},[visited,active,preload,props.src,retry]);
 if(!active&&!preload&&!visited)return null;
 const delivered=typeof props.src==='string'?photoAttributes(props.src,props.sizes):{src:props.src,srcSet:undefined};
 const unavailable=failed||failedSources.has(props.src||'');
 return <img {...props} {...delivered} ref={image} key={retry} src={unavailable?undefined:delivered.src} srcSet={unavailable?undefined:(props.srcSet||delivered.srcSet)} loading={preload?'eager':props.loading} onLoad={event=>{props.onLoad?.(event);ready();}} onError={event=>{if(props.src){if(failedSources.size>=500)failedSources.clear();failedSources.add(props.src);}setFailed(true);callbacks.current.onFailure?.();props.onError?.(event);}} hidden={!active} className={`${props.className||''}${active?'':' hidden'}`} />;
}
