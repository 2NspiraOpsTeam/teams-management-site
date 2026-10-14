import { MediaManager } from '@/components/admin/MediaManager';
export const runtime='nodejs';
export default function MediaPage(){return <main id="main-content" className="mx-auto max-w-7xl p-4 sm:p-6"><h1 className="mb-2 text-3xl font-semibold">Media Library</h1><p className="mb-7 text-slate-600">View the overall image inventory. To add property photos, open that property’s Media page.</p><MediaManager mode="library"/></main>}
