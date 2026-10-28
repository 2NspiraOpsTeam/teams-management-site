export type NeighborhoodVideoData = { id: string; title: string; channel: string; startSeconds: number };

export function NeighborhoodVideo({ video }: { video: NeighborhoodVideoData }) {
  const source = `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}&t=${video.startSeconds}s`;
  return <div className="mt-8 min-w-0 border-t border-stone-400/40 pt-6 lg:col-span-2" data-neighborhood-video>
    <h3 className="font-serif text-2xl text-teams-ink">Watch: {video.title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-700">A neighborhood film from {video.channel}. Select Play to explore Restaurant Row.</p>
    <div className="mt-5 aspect-video min-h-[200px] w-full max-w-4xl bg-teams-charcoal">
      <iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?start=${video.startSeconds}&autoplay=0&rel=0`} title={`${video.title} — ${video.channel}`} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full min-h-[200px] w-full border-0" />
    </div>
    <a href={source} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Watch on YouTube ↗</a>
  </div>;
}
