import type { ReactNode } from 'react';
import { WebsiteContentProvider } from './website-text';
import { publishedWebsiteContent } from '@/lib/website-content-store';
import { adminDb } from '@/lib/admin-auth';
/** A fresh public page payload carries current wording even when the root layout is reused. */
export async function renderWebsiteContent(content:ReactNode) {
  const values=await publishedWebsiteContent(adminDb());
  return <WebsiteContentProvider values={values}>{content}</WebsiteContentProvider>;
}
