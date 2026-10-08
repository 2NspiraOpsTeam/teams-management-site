import Link from 'next/link';
export const runtime='edge';
export default function AdminHome(){return <main className="mx-auto max-w-4xl p-6"><h1 className="text-3xl font-semibold">Admin</h1><nav className="mt-6 flex gap-4"><Link href="/admin/buildings">Buildings</Link><Link href="/admin/units">Units</Link><Link href="/admin/inquiries">Inquiries</Link></nav></main>}
