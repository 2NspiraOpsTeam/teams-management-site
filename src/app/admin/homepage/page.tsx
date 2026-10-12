import { PageShowcaseManager } from '@/components/admin/PageShowcaseManager';
import { MediaManager } from '@/components/admin/MediaManager';
export const runtime='edge';
export default function HomepageAdmin(){return <main className="mx-auto max-w-7xl p-4 sm:p-6"><h1 className="mb-2 text-3xl font-semibold">Homepage images</h1><p className="mb-7 text-slate-600">Choose approved property images for the homepage hero, Featured Properties, and Across the city. The property link follows its approved image. Publishing is separate from uploading.</p><MediaManager mode="home"/><PageShowcaseManager/></main>}
