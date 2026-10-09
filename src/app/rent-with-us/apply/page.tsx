import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { RentalApplicationForm } from '@/components/rental-application-form';
import { previewPortfolio, previewPortfolioEnabled } from '@/lib/preview-portfolio';

export const runtime = 'edge';
export default function ApplyPage() {
  if (!previewPortfolioEnabled) notFound();
  return <><Header /><main className="bg-stone-50 min-h-screen"><div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16"><p className="uppercase tracking-[.2em] text-xs text-teams-secondary mb-3">Teams Management · Preview</p><h1 className="text-4xl sm:text-5xl font-serif text-teams-ink mb-4">Rental application</h1><p className="text-teams-secondary max-w-2xl">This is a form preview. You can review the questions, but answers are kept only in this open page. Closing or refreshing clears them. Applications cannot be submitted yet.</p><RentalApplicationForm properties={previewPortfolio.filter(p=>p.slug!=='71-e-110th-st').map(p=>({id:p.id,label:p.name}))} /></div></main><Footer /></>;
}
