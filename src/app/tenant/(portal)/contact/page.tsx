import Link from "next/link";
export const runtime = "edge";
export default function ContactManagement() {
  return (
    <>
      <h1 className="text-3xl font-serif font-semibold">Contact Management</h1>
      <p className="mt-4 max-w-2xl">
        For repairs, submit a maintenance request so the office can review the
        issue and you can follow its progress.
      </p>
      <Link
        href="/tenant/maintenance"
        className="mt-5 inline-flex min-h-12 items-center rounded bg-teams-gold px-5 font-semibold"
      >
        Maintenance Requests
      </Link>
      <p className="mt-6">
        For other questions, use your building’s management contact information
        or our contact page.
      </p>
      <Link
        href="/contact"
        className="inline-flex min-h-12 items-center underline"
      >
        Management contact information
      </Link>
      <aside className="mt-8 max-w-2xl border-l-4 border-red-700 bg-white p-5">
        <h2 className="font-semibold">Emergency assistance</h2>
        <p>
          Do not report emergencies solely online. For immediate danger to life
          or property, call 911 or the appropriate emergency service. Use the
          property’s designated emergency contact in your lease or building
          notices for urgent property issues.
        </p>
      </aside>
    </>
  );
}
