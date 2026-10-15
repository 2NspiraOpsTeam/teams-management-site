import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/admin-auth';
import { MediaManager } from '@/components/admin/MediaManager';
export const runtime='nodejs';
export default async function PropertyMediaAdmin({params}:{params:Promise<{id:string}>}){const {id}=await params;const row=await adminDb().prepare('SELECT name,slug FROM buildings WHERE id=?').bind(id).first<{name:string;slug:string}>();if(!row)notFound();return <main id="main-content" className="mx-auto max-w-7xl p-4 sm:p-6"><h1 className="mb-2 text-3xl font-semibold">{row.name} · Media / Gallery</h1><p className="mb-7 text-slate-600">Choose separate Residential and Retail covers and galleries using the same approved property images. No duplicate uploads are needed.</p><MediaManager mode="property" buildingId={id} slug={row.slug}/></main>}
