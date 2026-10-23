import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { pageMetadata } from '@/lib/site-seo';

export const metadata = pageMetadata('/in-the-news', 'In the News | Teams Management', 'Explore selected real estate coverage from The New York Times, The Real Deal, and Crain’s New York Business, with links to the original articles.');

const articles = [
  {
    publisher: 'The New York Times', date: '2003-10-05', displayDate: 'October 5, 2003',
    title: 'For Rental Buildings, A Rising Market',
    summary: 'An archival feature by Alan S. Oser on Manhattan’s rental-building market, featuring Frank Pecora.',
    href: 'https://www.nytimes.com/2003/10/05/realestate/for-rental-buildings-a-rising-market.html',
    archiveHref: 'https://www.gmaloneco.com/oct5nyt.htm',
    image: '/images/news/nyt-rental-buildings-2003.jpg',
  },
  {
    publisher: 'Crain’s New York Business', date: '2026-08-25', displayDate: 'August 25, 2026',
    title: 'Former New York-Presbyterian dorm in Lower Manhattan sells at steep discount',
    summary: 'Coverage of the sale of 69 Gold Street in Lower Manhattan.',
    href: 'https://www.crainsnewyork.com/real-estate/residential/cny-kings-capital-buys-69-gold-20260824/',
  },
  {
    publisher: 'The Real Deal', date: '2025-09-16', displayDate: 'September 16, 2025',
    title: 'Waterfront Queens mansion snags Malba’s priciest deal at $6M',
    summary: 'A look at the record-setting sale of the waterfront home at 117 Malba Drive.',
    href: 'https://therealdeal.com/new-york/2025/09/16/waterfront-mansion-snags-malba-queens-priciest-deal/',
  },
  {
    publisher: 'The Real Deal', date: '2025-09-16', displayDate: 'September 16, 2025',
    title: 'NYC’s top deals: Queens waterfront mansion trades for $6M',
    summary: 'A New York transaction roundup that includes 117 Malba Drive and identifies the seller as an LLC linked to Frank Pecora.',
    href: 'https://therealdeal.com/new-york/2025/09/16/new-york-top-real-estate-deals-monday-sept-15-2025/',
  },
  {
    publisher: 'The Real Deal', date: '2025-06-25', displayDate: 'June 25, 2025',
    title: 'MTA launches next eminent domain push for Second Ave subway',
    summary: 'Reporting on the Second Avenue subway extension in East Harlem, including the Pecora family’s property proceedings.',
    href: 'https://therealdeal.com/new-york/2025/06/25/mta-launches-next-eminent-domain-push-for-second-ave-subway/',
  },

];

export default function NewsPage() {
  return <><Header /><main id="main-content" className="bg-[#f7f4ee] text-teams-ink">
    <section className="border-b border-[#B49355]/40 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-6 h-px w-14 bg-[#B49355]" />
        <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">The press collection</p>
        <h1 className="font-serif text-5xl sm:text-7xl">In the News</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">A selection of stories from the world of New York real estate, spanning decades of properties, people, and a changing city.</p>
      </div>
    </section>
    <section aria-labelledby="coverage-title" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="coverage-title" className="font-serif text-3xl">Selected coverage</h2>
        <p className="text-sm text-slate-600">From 2003 to today</p>
      </div>
      <div className="space-y-5">
        {articles.map((article) => <article key={article.href} className="grid gap-5 border border-[#E8E5DF] bg-white p-6 sm:grid-cols-[9rem_1fr] sm:gap-8 sm:p-8">
          {article.image && <figure className="sm:col-span-2 border-b border-[#E8E5DF] pb-6"><a href={article.archiveHref} target="_blank" rel="noopener noreferrer" aria-label="View the New York Times article reproduction (opens in a new tab)" className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#73551d]"><img src={article.image} width={393} height={312} alt="New York Times Real Estate clipping showing Frank Pecora outside a Manhattan building and inside a stairwell." className="mx-auto h-auto w-full max-w-[393px]" /></a><figcaption className="mt-4 text-center text-xs leading-relaxed text-slate-600">The New York Times, October 5, 2003 · Article image via Georgia Malone &amp; Company</figcaption></figure>}
          <div><p className="text-sm font-semibold leading-relaxed text-[#73551d]">{article.publisher}</p><time dateTime={article.date} className="mt-2 block text-sm text-slate-600">{article.displayDate}</time>{article.image && <p className="mt-3 text-xs uppercase tracking-widest text-slate-500">Featured story</p>}</div>
          <div><h3 className="font-serif text-2xl leading-snug sm:text-3xl"><a href={article.href} target="_blank" rel="noopener noreferrer" className="decoration-[#B49355] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#73551d]">{article.title}<span className="sr-only"> (opens in a new tab)</span></a></h3>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">{article.summary}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2"><a href={article.href} target="_blank" rel="noopener noreferrer" aria-label={`Read article: ${article.title} (opens in a new tab)`} className="mt-4 inline-flex min-h-11 items-center gap-2 border-b border-[#B49355] text-sm font-semibold hover:text-[#73551d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#73551d]">Read article <span aria-hidden="true">↗</span></a>
            {article.archiveHref && <a href={article.archiveHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-slate-600 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#73551d]">Read archived article <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>}</div>
          </div>
        </article>)}
      </div>
      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-slate-600">Links open in a new tab. Original publisher links and an archived reproduction are provided. A subscription or sign-in may be required. Headlines and reporting belong to their respective publishers.</p>
    </section>
  </main><Footer /></>;
}
