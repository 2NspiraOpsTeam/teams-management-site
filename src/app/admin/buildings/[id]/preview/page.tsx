import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/admin-auth';

export const runtime = 'edge';

export default async function BuildingPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await adminDb().prepare('SELECT name,slug,address_json,publication_state FROM buildings WHERE id = ? AND publication_state != ?').bind(id, 'archived').first<{name:string;slug:string;address_json:string;publication_state:string}>();
  if (!row) notFound();
  const address = JSON.parse(row.address_json) as {street:string;city:string;state:string};
  return <main className="mx-auto max-w-4xl p-6"><Link href="/admin/buildings" className="text-sm underline">Back to buildings</Link><div className="mt-8 border-t border-teams-gold pt-6"><p className="text-sm font-medium uppercase tracking-wider text-slate-600">Admin preview · {row.publication_state}</p><h1 className="mt-3 text-4xl font-serif text-slate-900">{row.name}</h1><p className="mt-4 text-lg text-slate-600">{address.street}, {address.city}, {address.state}</p><div className="mt-12 border border-teams-gold/60 bg-slate-50 p-6 text-slate-700"><h2 className="text-xl font-serif">Not ready for publication</h2><p className="mt-3">This preview shows verified address information only. Approved property copy and photography are still needed.</p></div></div></main>;
}
