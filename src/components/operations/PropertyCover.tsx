'use client';
import {useState} from 'react';

export function PropertyCover({assetId,name}:{assetId?:string|null;name:string}){
 const [failed,setFailed]=useState(false);
 return <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
 {assetId&&!failed?<img src={`/api/admin/media/${encodeURIComponent(assetId)}/file`} alt={`${name} — property cover`} width={640} height={480} loading="lazy" decoding="async" className="h-full w-full object-cover" onError={()=>setFailed(true)}/>:<div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-stone-500"><span aria-hidden="true" className="font-serif text-2xl">TM</span><span className="text-xs">Cover photo unavailable</span></div>}
 </div>;
}
