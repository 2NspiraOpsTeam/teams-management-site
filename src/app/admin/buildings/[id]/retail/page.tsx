import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/admin-auth';
import { RetailEditor } from '@/components/admin/RetailEditor';
export const runtime='edge';
export default async function RetailAdmin({params}:{params:Promise<{id:string}>}){const {id}=await params;const row=await adminDb().prepare('SELECT id,name,slug FROM buildings WHERE id=?').bind(id).first<{id:string;name:string;slug:string}>();if(!row)notFound();return <main className="mx-auto max-w-4xl p-4 sm:p-6"><h1 className="text-3xl font-semibold">{row.name} · Retail</h1><p className="mt-2 text-slate-600">Manage this property’s Retail listing. Published retail status is separate from the general property profile.</p><RetailEditor id={id} slug={row.slug}/></main>}
