
'use client';
import {button} from './shared';
export function LeaseLinkPreview({url}:{url:string}){
 let href='';try{const u=new URL(url.trim());if(u.protocol==='https:'&&!u.username&&!u.password)href=u.href;}catch{}
 return <div className="space-y-1"><a role="link" className={button+' inline-flex min-h-11 items-center'} href={href||undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!href} onClick={e=>{if(!href)e.preventDefault();}} tabIndex={href?0:-1}>Open link ↗</a><p className="text-sm text-slate-600">Opens in a new tab without saving. Shared links do not need to end in .pdf. Check the file and access before saving.</p></div>;
}
