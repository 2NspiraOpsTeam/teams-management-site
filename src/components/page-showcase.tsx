import Link from 'next/link';
import { adminDb } from '@/lib/admin-auth';
import { pageShowcase, type ShowcasePage } from '@/lib/page-showcase';
import { directionsUrl } from '@/lib/map-location';

export async function PageShowcase({page,retailIds,variant='split'}:{page:ShowcasePage;retailIds?:string[];variant?:'split'|'wide'|'offset'}) {
 const item=await pageShowcase(adminDb(),page,retailIds);
 if(!item)return null;
 let address: {street:string;city:string;state:string;zip:string;neighborhood?:string}={street:'',city:'',state:'',zip:''};
 try {address=JSON.parse(item.address_json||'{}');}catch{}
 const place=[address.neighborhood,address.city,address.state].filter(Boolean).join(' · ');
 return <section aria-label={page==='retail'?'Featured retail property':'Featured property'} className={`page-showcase page-showcase--${variant} bg-[#f7f4ee] py-16 sm:py-24`}><div className="mx-auto grid max-w-7xl items-center gap-7 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12"><div className="page-showcase-image group overflow-hidden bg-stone-200"><img src={item.image} alt={item.alt_text||`Approved photograph of ${item.property_name}`} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 motion-reduce:transition-none group-hover:scale-[1.025]"/></div><div className="max-w-lg py-2"><p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">{page==='retail'?'Featured retail property':'Featured property'}</p><h2 className="font-serif text-4xl font-normal leading-tight text-teams-ink sm:text-5xl">{item.property_name}</h2>{place&&<p className="mt-4 text-sm text-teams-secondary">{place}</p>}{item.caption&&<p className="mt-5 max-w-md text-base text-teams-secondary">{item.caption}</p>}<div className="mt-8 flex flex-wrap items-center gap-4"><Link href={`/properties/${item.property_slug}`} className="inline-flex min-h-11 items-center bg-teams-gold px-6 py-3 font-semibold text-teams-ink transition-colors hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">View Property ↗</Link>{address.street&&<a href={directionsUrl(address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-teams-ink text-sm font-semibold text-teams-ink hover:border-teams-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Map &amp; Directions ↗</a>}</div></div></div></section>;
}
