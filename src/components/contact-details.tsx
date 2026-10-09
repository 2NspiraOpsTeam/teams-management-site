import { contactAddress, contactEmailHref, contactPhoneHref, siteContact } from '@/lib/site-contact';

export function ContactDetails({ dark = false }: { dark?: boolean }) {
  const linkClass = dark ? 'text-white' : 'text-slate-950';
  return (
    <address className="not-italic text-sm leading-relaxed space-y-2">
      <p>Email: <a className={`${linkClass} underline underline-offset-4 break-all`} href={contactEmailHref}>{siteContact.email}</a></p>
      <p>Phone: <a className={`${linkClass} underline underline-offset-4`} href={contactPhoneHref}>{siteContact.phone}</a></p>
      <p>Fax: {siteContact.fax}</p>
      <p>Address: {contactAddress}</p>
    </address>
  );
}
