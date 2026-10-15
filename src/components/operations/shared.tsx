'use client';
import Link from 'next/link';
export type RecordRow=Record<string,any>;
export const api='/api/admin/operations';
export const control='block min-h-11 w-full min-w-0 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900';
export const button='inline-flex min-h-11 items-center justify-center rounded border border-slate-400 px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50';
export const primary=button+' border-teams-ink bg-teams-ink text-white';
export const title=(r:RecordRow)=>r.full_name||r.display_name||r.unit_identifier||r.name||r.email||r.id;
export const label=(s:string)=>s.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
export const href=(entity:string,id:string)=>entity==='properties'?`/admin/properties/${id}`:`/admin/operations/${entity}/${id}`;
export const dollars=(c:number|null)=>c===null||c===undefined?'Not supplied':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(c/100);
export async function read(path:string,signal?:AbortSignal){const r=await fetch(api+path,{cache:'no-store',signal});const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to load records.');return d;}
export async function write(path:string,method:string,data:unknown){const r=await fetch(api+path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const d=await r.json();if(!r.ok)throw Error(d.error||'Save was not confirmed. Keep your draft and retry.');return d;}
export function OperationsNav(){return <nav aria-label="Property operations" className="mb-5 flex flex-wrap gap-x-5 gap-y-1 border-b pb-3 text-sm">{[['Properties','/admin/properties'],['Apartments','/admin/operations/units'],['Leases','/admin/operations/leases'],['Superintendents','/admin/superintendents']].map(([name,to])=><Link prefetch={false} className="inline-flex min-h-11 items-center underline underline-offset-4" key={to} href={to}>{name}</Link>)}</nav>;}
export function Address({value}:{value:string}){try{const a=JSON.parse(value);return <span>{[a.street,a.city,a.state,a.zip].filter(Boolean).join(', ')}{!a.zip?' · ZIP not supplied':''}</span>;}catch{return <span>Address needs review</span>;}}
