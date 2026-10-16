'use client';
import {useEffect,useState} from 'react';
import {read,type RecordRow} from './shared';
import {MetricGrid} from './MetricGrid';
export function Overview(){const [data,setData]=useState<RecordRow|null>(null),[error,setError]=useState('');useEffect(()=>{void read('/overview').then(setData).catch(e=>setError(e.message));},[]);return <main id="main-content" className="mx-auto max-w-7xl p-4 sm:p-8"><h1 className="text-3xl font-serif font-semibold">Daily operations</h1><p className="my-5 text-slate-600">Open any metric to review the matching records.</p>{error&&<p role="alert">{error}</p>}{!data&&!error&&<p role="status">Loading portfolio…</p>}{data&&<MetricGrid data={data}/>}</main>;}
