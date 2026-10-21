'use client';

import { useRef, useState } from 'react';

const googleReviews = 'https://www.google.com/maps/place/Teams+Management+LLC/data=!4m2!3m1!1s0x89c258c0e0b65e2d:0xa24510b57f3f6d39';

// Verbatim excerpts checked against the public Google listing on 2026-10-21.
// Deliberately selected highlights, not a live feed or an aggregate rating.
const reviews = [
  { name: 'Pat Gunn', quote: "Over my time there they've been responsive, open to negotiation, and good at communication." },
  { name: 'Michael Morris', quote: "I've been living in a Teams Mgt building in Flushing for about 5 years, and I have nothing but positive things to say." },
  { name: 'Asia Lu', quote: 'We just moved to NYC into a new build and the people at Teams Management have been great to work with.' },
];

export function ResidentReviews() {
  const rail = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function show(next: number) {
    const element = rail.current;
    const card = element?.children[next] as HTMLElement | undefined;
    if (!element || !card) return;
    // Immediate movement keeps repeated clicks predictable and avoids motion.
    element.scrollTo({ left: card.offsetLeft - (element.children[0] as HTMLElement).offsetLeft, behavior: 'instant' });
    setIndex(next);
  }

  return <section className="border-t border-[#e6dfd2] bg-[#f7f4ee] py-16 sm:py-24" aria-labelledby="reviews-title">
    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
        <div><p className="home-eyebrow">In our residents’ words</p><h2 id="reviews-title" className="mb-3 font-serif text-3xl font-normal sm:text-5xl">A place to feel at home.</h2><p className="mb-0 text-sm text-teams-secondary">Selected positive reviews from Google. Excerpts shown.</p></div>
        <a href={googleReviews} target="_blank" rel="noopener noreferrer" className="home-text-link text-sm">Read all Google reviews <span className="sr-only">(opens in a new tab)</span><span aria-hidden="true">↗</span></a>
      </div>
      <div ref={rail} tabIndex={0} role="region" aria-label="Selected resident reviews; scroll to browse" onScroll={() => {
        const element = rail.current;
        if (!element) return;
        if (element.scrollWidth - element.clientWidth - element.scrollLeft < 2) { setIndex(reviews.length - 1); return; }
        const first = element.children[0] as HTMLElement;
        const second = element.children[1] as HTMLElement;
        setIndex(Math.max(0, Math.min(reviews.length - 1, Math.round(element.scrollLeft / (second.offsetLeft - first.offsetLeft)))));
      }} className="relative flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teams-ink lg:grid lg:grid-cols-3">
        {reviews.map(review => <figure key={review.name} className="m-0 flex w-[88%] shrink-0 snap-start flex-col border border-[#e6dfd2] bg-white p-6 sm:w-[65%] sm:p-8 lg:w-auto">
          <div role="img" aria-label="5 out of 5 stars" className="mb-5 tracking-[.2em] text-[#806124]">★★★★★</div>
          <blockquote className="mb-7 flex-1 font-serif text-xl leading-relaxed text-teams-ink">“{review.quote}”</blockquote>
          <figcaption className="border-t border-[#e6dfd2] pt-5"><span className="block text-sm font-semibold">{review.name}</span><span className="mt-1 block text-xs text-teams-secondary">Google review · excerpt</span></figcaption>
        </figure>)}
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm lg:hidden">
        <button type="button" disabled={index === 0} onClick={() => show(index - 1)} aria-label="Previous review" className="min-h-11 min-w-11 rounded-full border border-teams-ink text-xl disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">‹</button>
        <span aria-live="polite" aria-atomic="true">{index + 1} / {reviews.length}</span>
        <button type="button" disabled={index === reviews.length - 1} onClick={() => show(index + 1)} aria-label="Next review" className="min-h-11 min-w-11 rounded-full border border-teams-ink text-xl disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">›</button>
      </div>
    </div>
  </section>;
}
