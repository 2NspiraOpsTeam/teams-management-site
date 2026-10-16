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
// Load bounded selector pages; never silently omit apartments after the first 50.
export async function options(path:string,signal?:AbortSignal){const items:RecordRow[]=[];for(let page=0;page<20;page++){const d=await read(path+(path.includes('?')?'&':'?')+'page='+page,signal);items.push(...d.items);if(d.nextPage===null)return items;}throw Error('Too many matches. Narrow the selection to one property.');}
export async function write(path:string,method:string,data:unknown){const r=await fetch(api+path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const d=await r.json();if(!r.ok)throw Error(d.error||'Save was not confirmed. Keep your draft and retry.');return d;}
// The shared Admin shell owns navigation; avoid repeating every module above each table.
export function OperationsNav(){return null;}
export function Address({value}:{value:string}){try{const a=JSON.parse(value);return <span>{[a.street,a.city,a.state,a.zip].filter(Boolean).join(', ')}{!a.zip?' · ZIP not supplied':''}</span>;}catch{return <span>Address needs review</span>;}}
