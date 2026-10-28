'use client';

import { useState } from 'react';

export type NeighborhoodVideoData = { id: string; title: string; channel: string; startSeconds: number };

export function NeighborhoodVideo({ video }: { video: NeighborhoodVideoData }) {
  const [open, setOpen] = useState(false);
  const source = `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}&t=${video.startSeconds}s`;
  return <div className="mt-8 min-w-0 border-t border-stone-400/40 pt-6 lg:col-span-2" data-neighborhood-video>
    <h3 className="font-serif text-2xl text-teams-ink">Watch: {video.title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-700">A neighborhood film from {video.channel}. Starts at the beginning.</p>
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      <button type="button" aria-expanded={open} aria-controls="restaurant-row-player" onClick={() => setOpen(!open)} className="inline-flex min-h-11 items-center gap-2 rounded bg-teams-gold px-5 py-3 font-semibold text-teams-ink hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">{open ? 'Close video' : 'Watch Restaurant Row'} <span aria-hidden="true">{open ? '−' : '▶'}</span></button>
      <a href={source} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Watch on YouTube ↗</a>
    </div>
    <div id="restaurant-row-player" hidden={!open} className="mt-5 aspect-video min-h-[200px] w-full max-w-4xl bg-teams-charcoal">
      {open && <iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?start=${video.startSeconds}&autoplay=1&rel=0`} title={`${video.title} — ${video.channel}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full min-h-[200px] w-full border-0" />}
    </div>
  </div>;
}
