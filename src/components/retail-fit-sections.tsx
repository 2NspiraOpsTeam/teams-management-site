import { PublishedPhoto } from '@/components/published-photo';
import type { RetailImage } from '@/lib/retail-profile';

type Fact = { label: string; value: string };

const groups = [
  { title: 'Space', labels: ['Retail square feet', 'Storefront frontage', 'Floor / location', 'Ceiling height', 'Gas', 'Electrical capacity', 'Venting', 'Lower level / storage', 'Loading / delivery', 'Accessibility'] },
  { title: 'Visibility & access', labels: ['Corner location', 'Street exposure', 'Nearby transit', 'Loading / delivery', 'Signage'] },
  { title: 'Use context', labels: ['Approved uses', 'Venting', 'Gas', 'Electrical capacity', 'Accessibility'] },
] as const;

export function RetailFitSections({ facts, floorplans }: { facts: Fact[]; floorplans: RetailImage[] }) {
  const publishedGroups = groups.map(group => ({
    ...group,
    facts: facts.filter(fact => fact.value.trim() && group.labels.some(label => label === fact.label)),
    floorplans: group.title === 'Space' ? floorplans : [],
  })).filter(group => group.facts.length > 0 || group.floorplans.length > 0);

  // Missing editorial content is an absent section, not a public work-in-progress note.
  if (!publishedGroups.length) return null;

  return <section aria-labelledby="retail-fit-title" className="bg-white py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
      <h2 id="retail-fit-title" className="font-serif text-3xl sm:text-4xl">Space details</h2>
      <div className={`mt-10 grid gap-10 ${publishedGroups.length === 3 ? 'lg:grid-cols-3' : publishedGroups.length === 2 ? 'lg:grid-cols-2' : ''}`}>
        {publishedGroups.map(group => <div key={group.title} className="min-w-0 border-t border-stone-300 pt-5">
          <h3 className="font-serif text-2xl">{group.title}</h3>
          {group.facts.length > 0 && <dl className="mt-5 space-y-4">{group.facts.map(fact => <div key={fact.label}>
            <dt className="text-xs uppercase tracking-widest text-teams-secondary">{fact.label}</dt>
            <dd className="mt-1 break-words font-medium">{fact.value}</dd>
          </div>)}</dl>}
          {group.floorplans.length > 0 && <div className="mt-6 space-y-6">{group.floorplans.map(plan => <figure key={plan.src}>
            <a href={plan.src} target="_blank" rel="noopener noreferrer">
              <PublishedPhoto src={plan.src} alt={plan.alt} loading="lazy" className="w-full border border-stone-200" />
              <span className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline">View floor plan ↗</span>
            </a>
          </figure>)}</div>}
        </div>)}
      </div>
    </div>
  </section>;
}
