import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/admin-auth';
import { mediaPreviewUrl, propertyMedia } from '@/lib/media-management';

export const runtime = 'edge';

export default async function BuildingPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await adminDb().prepare('SELECT name,slug,address_json,publication_state FROM buildings WHERE id = ? AND publication_state != ?').bind(id, 'archived').first<{name:string;slug:string;address_json:string;publication_state:string}>();
  if (!row) notFound();
  const media = await propertyMedia(adminDb(),row.slug,true);
  const cover=media.find(item=>item.is_cover);
  const address = JSON.parse(row.address_json) as {street:string;city:string;state:string};
  return <main className="mx-auto max-w-4xl p-6"><Link href="/admin/buildings" className="text-sm underline">Back to buildings</Link><div className="mt-8 border-t border-slate-200 pt-6"><p className="text-sm font-medium uppercase tracking-wider text-slate-600">Admin preview · {row.publication_state}</p><h1 className="mt-3 text-4xl font-serif text-slate-900">{row.name}</h1><p className="mt-4 text-lg text-slate-600">{address.street}, {address.city}, {address.state}</p><div className="mt-10">{cover?<img src={mediaPreviewUrl(cover.id)} alt={cover.alt_text||`Preview cover for ${row.name}`} className="aspect-[16/9] w-full object-cover"/>:<div className="flex aspect-[16/9] items-center justify-center bg-slate-900 font-serif text-4xl text-amber-400">TM</div>}</div><div className="mt-6 grid gap-4 sm:grid-cols-2">{media.filter(item=>!item.is_cover).map(item=><figure key={item.assignment_id}><img src={mediaPreviewUrl(item.id)} alt={item.alt_text||`Preview image for ${row.name}`} className="aspect-[4/3] w-full object-cover"/>{item.caption&&<figcaption className="mt-2 text-sm text-slate-600">{item.caption}</figcaption>}</figure>)}</div><p className="mt-8 rounded border border-amber-200 bg-amber-50 p-3 text-sm">Admin preview includes draft images. Public pages show only published assignments from public assets.</p></div></main>;
}
