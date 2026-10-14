import type { ReactNode } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return <><Header /><main className="min-h-[65vh] bg-[#f7f4ee]"><div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20"><div className="mb-6 h-px w-12 bg-teams-gold" /><h1 className="mb-4 font-serif text-4xl text-teams-ink sm:text-5xl">{title}</h1><p className="mb-10 text-sm text-slate-600">Last updated October 14, 2026</p><div className="space-y-8 text-slate-700 leading-7 [&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-teams-ink [&_p]:mb-3 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-teams-gold [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-teams-ink">{children}</div></div></main><Footer /></>;
}
