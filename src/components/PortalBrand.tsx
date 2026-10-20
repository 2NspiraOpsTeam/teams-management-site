import {PublishedPhoto} from '@/components/published-photo';
import Link from 'next/link';

/** Shared private-workspace branding using the approved company artwork. */
export function PortalBrand({ href, label, inverse = false }: { href: string; label: string; inverse?: boolean }) {
  return <Link prefetch={false} href={href} className={`portal-brand${inverse ? ' portal-brand-inverse' : ''}`} aria-label={`Teams Management — ${label} home`}>
    <PublishedPhoto src="/brand/teams-management-logo.png" alt="" width={64} height={64} className="portal-brand-image" />
    <span className="portal-brand-copy"><span className="portal-brand-name">Teams Management</span><span className="portal-brand-label">{label}</span></span>
  </Link>;
}
