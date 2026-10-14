'use client';

import Link from 'next/link';
import { useState } from 'react';

export type DiningProperty = { slug: string; name: string; image: string; alt: string; href: string };

export function DiningPropertyRotation({ properties }: { properties: DiningProperty[] }) {
  const [index, setIndex] = useState(0);

  if (!properties.length) return null;
  const property = properties[index];
  const move = (direction: number) => setIndex(current => (current + direction + properties.length) % properties.length);

  return <section className="border-t border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="featured-property">
    <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2 md:gap-12">
      <Link prefetch={false} href={property.href} className="group block overflow-hidden rounded-sm bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B49355]" aria-label={`View ${property.name} property`}>
        <img src={property.image} alt={property.alt} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none" />
      </Link>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8b681f]">Featured property</p>
        <h2 id="featured-property" className="mt-3 font-serif text-3xl sm:text-4xl">{property.name}</h2>
        <p className="mt-3 max-w-lg leading-relaxed text-slate-700">Discover another address in the Teams Management portfolio.</p>
        <Link prefetch={false} href={property.href} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm bg-teams-gold px-6 py-3 font-semibold text-teams-ink transition-colors hover:bg-teams-gold-highlight">View {property.name} →</Link>
        {properties.length > 1 && <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <button type="button" onClick={() => move(-1)} aria-label="Previous featured property" className="min-h-11 min-w-11 rounded-full border border-teams-ink text-xl focus-visible:outline focus-visible:outline-2">‹</button>
          <span aria-live="polite">{index + 1} / {properties.length}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next featured property" className="min-h-11 min-w-11 rounded-full border border-teams-ink text-xl focus-visible:outline focus-visible:outline-2">›</button>
        </div>}
      </div>
    </div>
  </section>;
}
