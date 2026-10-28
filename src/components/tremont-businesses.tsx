import { tremontStorefronts } from '@/lib/tremont-preview';

export function TremontBusinesses() {
  return (
    <section id="businesses" aria-labelledby="businesses-heading" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">Discover Primo Plaza</p>
        <h2 id="businesses-heading" className="mt-3 font-serif text-3xl sm:text-4xl">A place for everyday life</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-teams-secondary">Coffee stops, neighborhood services, and early learning—all in one place on East Tremont Avenue.</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['Building', 'Two stories'],
            ['Use', 'Retail, office & early learning'],
            ['Building area', 'Approximately 22,971 sq ft'],
          ].map(([label, value]) => <div key={label} className="border-t border-stone-300 pt-4"><dt className="text-xs uppercase tracking-widest text-teams-secondary">{label}</dt><dd className="mt-2 font-medium">{value}</dd></div>)}
        </dl>

        <article aria-labelledby="learning-experience-heading" className="mt-12 grid overflow-hidden rounded-2xl border border-[#cbdde9] bg-[#f0f7fb] md:grid-cols-[.85fr_1.15fr]">
          <div className="flex min-h-48 items-center justify-center bg-white p-8 sm:p-12">
            {/* Original brand artwork, served locally without a third-party request. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/storefronts/the-learning-experience.svg" alt="The Learning Experience" width="472" height="83" loading="lazy" className="h-auto w-full max-w-sm" />
          </div>
          <div className="p-7 sm:p-10">
            <p className="inline-flex rounded-full bg-[#174b70] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">Featured · Second floor</p>
            <h3 id="learning-experience-heading" className="mt-5 font-serif text-3xl sm:text-4xl">Little learners. Big possibilities.</h3>
            <p className="mt-3 text-lg font-semibold text-teams-ink">The Learning Experience — Throggs Neck</p>
            <p className="mt-3 max-w-xl leading-relaxed text-teams-secondary">Daycare and preschool right upstairs at Primo Plaza, with early education programs for infants, toddlers, and preschoolers.</p>
            <p className="mt-4 text-sm font-medium">3425 E Tremont Ave · Second floor · Bronx, NY</p>
            <a href="https://thelearningexperience.com/centers/throggs-neck/" target="_blank" rel="noopener noreferrer" aria-label="Explore The Learning Experience Throggs Neck center (opens in a new tab)" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#174b70] px-5 py-3 font-semibold text-white hover:bg-[#10364f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teams-ink">Explore the center ↗</a>
          </div>
        </article>

        <div className="mt-14 border-t border-stone-200 pt-10">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">Street-level retail</p>
          <h3 className="mt-3 font-serif text-3xl">Storefronts in the property</h3>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tremontStorefronts.map(store => (
              <article key={store.name} className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#faf9f6] shadow-sm motion-safe:transition-shadow hover:shadow-md">
                <div className={`flex h-40 items-center justify-center border-b border-stone-200 px-8 py-7 ${store.logoBackground}`}>
                  {store.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={store.logo} alt={`${store.name} logo`} width="240" height="104" loading="lazy" className="h-full w-full object-contain" />
                  ) : <span className="font-serif text-5xl text-[#365b48]">{store.name}</span>}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-teams-secondary">{store.description}</p>
                  <h4 className="mt-3 font-serif text-2xl">{store.name}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-teams-secondary">{store.address} · Bronx, NY</p>
                  {store.website && <a href={store.website} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${store.name} website (opens in a new tab)`} className="mt-5 inline-flex min-h-11 items-center justify-between gap-4 border-t border-stone-300 pt-3 font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teams-ink">Visit website <span aria-hidden="true">↗</span></a>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
