import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Database } from '@cloudflare/workers-types';

export const runtime = 'edge';

type GalleryRow = { storage_key: string; alt_text: string; caption: string | null; name: string; slug: string };

export default async function GalleryPage() {
  const env = getRequestContext().env as { DB?: D1Database; PUBLIC_MEDIA_BASE_URL?: string };
  // No URL is inferred from R2 keys. Delivery is disabled until a reviewed public origin exists.
  const base = env.PUBLIC_MEDIA_BASE_URL && /^https:\/\/[^/]+$/.test(env.PUBLIC_MEDIA_BASE_URL) ? env.PUBLIC_MEDIA_BASE_URL : null;
  const images = base && env.DB ? (await env.DB.prepare(`SELECT a.storage_key, m.alt_text, m.caption, b.name, b.slug FROM media_assignments m JOIN media_assets a ON a.id = m.asset_id JOIN buildings b ON b.id = m.building_id WHERE b.publication_state = 'published' AND a.visibility = 'public' AND m.unit_id IS NULL AND m.alt_text IS NOT NULL AND trim(m.alt_text) <> '' AND a.file_type LIKE 'image/%' ORDER BY b.name, m.order_index, m.id`).all<GalleryRow>()).results.filter(row => /^[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(row.storage_key)) : [];
  return <><Header /><main className="min-h-[65vh] bg-[#F8F7F3]"><section className="bg-teams-charcoal text-white py-16 sm:py-20"><div className="max-w-5xl mx-auto px-4 sm:px-6"><div className="h-px w-14 bg-white/50 mb-6" /><p className="uppercase tracking-[.2em] text-xs text-slate-200 mb-4">The portfolio in view</p><h1 className="text-4xl sm:text-6xl font-serif mb-6">Gallery</h1><p className="max-w-2xl text-lg text-slate-200">A visual look at Teams Management properties, as approved imagery becomes available.</p></div></section><section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">{images.length ? <div className="grid md:grid-cols-2 gap-8">{images.map((image, index) => <figure key={`${image.slug}-${index}`} className="bg-white border-b-2 border-slate-200"><img src={`${base}/${image.storage_key}`} alt={image.alt_text} className="w-full aspect-[4/3] object-cover" /><figcaption className="p-5"><Link href={`/properties/${image.slug}`} className="font-serif text-xl text-teams-charcoal underline decoration-slate-400 underline-offset-4">{image.name}</Link>{image.caption && <p className="text-sm text-slate-700 mt-2">{image.caption}</p>}</figcaption></figure>)}</div> : <div className="border-t border-slate-200 pt-8 grid md:grid-cols-2 gap-8 items-start"><h2 className="font-serif text-3xl text-teams-charcoal">Property photography is being prepared.</h2><div><p className="text-slate-700 leading-relaxed mb-6">Images will appear here only after they are approved for public use and linked to a published property. No private resident or maintenance images are shown.</p><Link href="/properties" className="inline-flex bg-teams-gold px-6 py-3 font-semibold text-teams-charcoal hover:bg-teams-gold-highlight">View properties</Link></div></div>}</section></main><Footer /></>;
}
