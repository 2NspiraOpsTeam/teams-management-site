import { WebsiteContentProvider } from '@/components/website-text';
import { publishedWebsiteContent } from '@/lib/website-content-store';
import { adminDb } from '@/lib/admin-auth';
/** Templates refresh on navigation; the persistent root layout must not hold stale published copy. */
export default async function WebsiteTemplate({children}:{children:React.ReactNode}) {
 const values=await publishedWebsiteContent(adminDb());
 return <WebsiteContentProvider values={values}>{children}</WebsiteContentProvider>;
}
