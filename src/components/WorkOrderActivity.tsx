import {
  type Detail,
  date,
  label,
  statuses,
  categories,
  address,
  statusDescriptions,
} from "@/lib/work-orders/shared";
export function WorkOrderActivity({
  data,
  admin = false,
}: {
  data: Detail;
  admin?: boolean;
}) {
  const r = data.request,
    base = admin
      ? "/api/admin/tenant-maintenance/photos/"
      : "/api/tenant/maintenance/photos/";
  return (
    <>
      <section className="my-5 space-y-2 rounded-lg border bg-white p-5">
        <h2 className="text-xl font-semibold">
          Request #{r.number} — {label(r.status, statuses)}
        </h2>
        <p>{statusDescriptions[r.status]}</p>
        <p>{label(r.category, categories)}</p>
        <p>Priority: {r.urgency === "urgent" ? "Urgent" : "Routine"}</p>
        {address(r.address_json) && <p>{address(r.address_json)}</p>}
        <p>
          {r.property_name} · Apartment {r.unit_identifier}
        </p>
        <p>
          Submitted {date(r.submitted_at)} · Updated {date(r.updated_at)}
        </p>
        <p className="whitespace-pre-wrap break-words">{r.description}</p>
        <p>
          Permission to enter when absent:{" "}
          {r.permission_to_enter === null
            ? "Not recorded"
            : r.permission_to_enter
              ? "Yes"
              : "No"}
        </p>
        <p className="text-sm">
          Permission does not replace applicable notice or lawful access
          requirements.
        </p>
        {r.access_instructions && (
          <p className="whitespace-pre-wrap break-words">
            Access instructions: {r.access_instructions}
          </p>
        )}
        <p>Preferred contact: {r.preferred_contact}</p>
        {r.completed_at && <p>Completed {date(r.completed_at)}</p>}
        {admin && r.staff_notes && (
          <p className="whitespace-pre-wrap">
            Legacy internal notes: {r.staff_notes}
          </p>
        )}
      </section>
      <h2 className="text-xl font-semibold">Activity history</h2>
      <ol className="mt-4 space-y-4">
        {data.events.map((e) => (
          <li
            key={e.id}
            className={
              "rounded border-l-4 p-4 " +
              (e.visibility === "internal"
                ? "border-amber-600 bg-amber-50"
                : "border-teams-gold bg-white")
            }
          >
            <h3 className="font-semibold">
              {date(e.created_at)} —{" "}
              {e.visibility === "internal"
                ? "Internal note"
                : e.status
                  ? label(e.status, statuses)
                  : e.actor_type === "tenant"
                    ? "Tenant update"
                    : "Management update"}
            </h3>
            {e.status && <p>{statusDescriptions[e.status]}</p>}
            {e.body && e.kind !== "submitted" && (
              <p className="mt-2 whitespace-pre-wrap break-words">{e.body}</p>
            )}
            {admin && (
              <p className="mt-2 text-sm text-slate-600">
                By {e.actor_id} ({e.actor_type})
              </p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.photos
                .filter((p) => p.event_id === e.id)
                .map((p) => (
                  <a
                    key={p.id}
                    href={base + p.id}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open maintenance photo in a new tab"
                  >
                    <img
                      src={base + p.id}
                      alt="Maintenance issue"
                      className="h-36 w-full rounded object-cover"
                      loading="lazy"
                    />
                  </a>
                ))}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
