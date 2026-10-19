import type { RetailImage } from '@/lib/retail-profile';

type Fact = { label: string; value: string };

const groups = [
  { title: 'Space', intro: 'Confirm the physical fit for your operation.', labels: ['Retail square feet', 'Storefront frontage', 'Floor / location', 'Ceiling height', 'Gas', 'Electrical capacity', 'Venting', 'Lower level / storage', 'Loading / delivery', 'Accessibility'] },
  { title: 'Visibility & access', intro: 'Review how customers and deliveries would reach this address.', labels: ['Corner location', 'Street exposure', 'Nearby transit', 'Loading / delivery', 'Signage'] },
  { title: 'Use context', intro: 'Check documented uses and physical constraints before planning a build-out.', labels: ['Approved uses', 'Venting', 'Gas', 'Electrical capacity', 'Accessibility'] },
] as const;

export function RetailFitSections({ facts, floorplans, cover, propertyName }: { facts: Fact[]; floorplans: RetailImage[]; cover?: {src:string;alt:string}; propertyName:string }) {
  return <section aria-labelledby="retail-fit-title" className="bg-white py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
    <div className={cover ? 'grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12' : ''}><div>
    <p className="text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">Evaluate this space</p>
    <h2 id="retail-fit-title" className="mt-3 font-serif text-3xl sm:text-4xl">Could this location work for your business?</h2>
    <p className="mt-4 max-w-3xl text-teams-secondary">Start with the verified details below. Ask us about anything not listed, then confirm dimensions, systems, access, and permitted use on a tour.</p>
    </div>{cover && <figure className="min-w-0 overflow-hidden border border-stone-200 bg-[#f7f4ee]"><img src={cover.src} alt={cover.alt} loading="lazy" className="aspect-[4/3] w-full object-scale-down bg-teams-charcoal"/><figcaption className="px-4 py-3 text-sm text-teams-secondary">{propertyName}</figcaption></figure>}</div>
    <div className="mt-10 grid gap-10 lg:grid-cols-3">{groups.map(group => { const selected = facts.filter(fact => group.labels.some(label => label === fact.label)); return <div key={group.title} className="border-t border-stone-300 pt-5"><h3 className="font-serif text-2xl">{group.title}</h3><p className="mt-2 text-sm text-teams-secondary">{group.intro}</p>{selected.length ? <dl className="mt-5 space-y-4">{selected.map(fact => <div key={fact.label}><dt className="text-xs uppercase tracking-widest text-teams-secondary">{fact.label}</dt><dd className="mt-1 font-medium">{fact.value}</dd></div>)}</dl> : <p className="mt-5 text-sm text-teams-secondary">Details not yet published. Ask our team to confirm.</p>}{group.title === 'Space' && floorplans.length > 0 && <div className="mt-6">{floorplans.map(plan => <figure key={plan.src}><a href={plan.src} target="_blank" rel="noopener noreferrer"><img src={plan.src} alt={plan.alt} loading="lazy" className="w-full border border-stone-200"/><span className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline">View approved floor plan ↗</span></a></figure>)}</div>}{group.title === 'Use context' && <p className="mt-5 text-xs text-teams-secondary">Published use information is not approval for a specific business. Confirm zoning, permits, and fit with the relevant authorities and your design team.</p>}</div>; })}</div>
  </div></section>;
}
