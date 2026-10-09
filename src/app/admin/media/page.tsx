import { MediaManager } from '@/components/admin/MediaManager';
export const runtime='edge';
export default function MediaPage(){return <main className="mx-auto max-w-7xl p-4 sm:p-6"><h1 className="mb-2 text-3xl font-semibold">Media Library</h1><p className="mb-7 text-slate-600">Upload once, then reuse images across properties and the homepage.</p><MediaManager mode="library"/></main>}
