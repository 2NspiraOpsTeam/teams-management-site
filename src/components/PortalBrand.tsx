import {PublishedPhoto} from '@/components/published-photo';
import Link from 'next/link';

/** Shared private-workspace branding using the approved company artwork. */
export function PortalBrand({ label, inverse = false }: { label: string; inverse?: boolean }) {
  return <Link prefetch={false} href="/" className={`portal-brand${inverse ? ' portal-brand-inverse' : ''}`} aria-label="Teams Management home">
    <PublishedPhoto src="/brand/teams-management-gold-emblem.png" alt="" width={64} height={64} className="portal-brand-image" />
    <span className="portal-brand-copy"><span className="portal-brand-name">Teams Management</span><span className="portal-brand-label">{label}</span></span>
  </Link>;
}
