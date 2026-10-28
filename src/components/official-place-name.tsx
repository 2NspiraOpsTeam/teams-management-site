/** A missing official site is plain text, never a search or directions fallback. */
export function OfficialPlaceName({ name, website, className }: { name: string; website: string | null; className?: string }) {
  if (!website || !/^https:\/\//.test(website)) return <span className={className}>{name}</span>;
  return <a href={website} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${name} official website (opens in a new tab)`} className={`${className || ''} underline decoration-teams-ink/40 underline-offset-4 hover:decoration-teams-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink`}>{name} <span aria-hidden="true">↗</span></a>;
}
