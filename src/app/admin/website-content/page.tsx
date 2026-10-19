import WebsiteContentEditor from '@/components/admin/WebsiteContentEditor';
import { contentPage } from '@/lib/website-content';
export default async function WebsiteContent({searchParams}:{searchParams:Promise<{page?:string}>}){const query=await searchParams;return <WebsiteContentEditor initialPage={query.page&&contentPage(query.page)?query.page:'home'}/>;}
