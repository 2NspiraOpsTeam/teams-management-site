"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  categories,
  statuses,
  label,
  date,
  address,
  type Order,
} from "@/lib/work-orders/shared";
import { WorkOrderPhotos, encodePhotos } from "@/components/WorkOrderPhotos";
type Assignment = {
  id: string;
  name: string;
  unit_identifier: string;
  address_json: string;
};
const field = "mt-1 w-full rounded border border-slate-300 bg-white p-3";
export function MaintenanceForm({
  assignments,
  tenant,
}: {
  assignments: Assignment[];
  tenant: { email: string; display_name: string | null };
}) {
  const receipt = useRef(crypto.randomUUID()),
    formRef = useRef<HTMLFormElement>(null),
    locked = useRef(false);
  const [rows, setRows] = useState<Order[]>([]),
    [loading, setLoading] = useState(true),
    [hasMore, setHasMore] = useState(false),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [preparing, setPreparing] = useState(false),
    [message, setMessage] = useState(""),
    [success, setSuccess] = useState<{ id: string; number: number } | null>(
      null,
    ),
    [files, setFiles] = useState<File[]>([]),
    [assignment, setAssignment] = useState(assignments[0]?.id || "");
  async function refresh(more = false) {
    setLoading(true);
    try {
      const r = await fetch(
        "/api/tenant/maintenance" +
          (more && rows.length
            ? "?before=" + rows[rows.length - 1].number
            : ""),
        { cache: "no-store" },
      );
      if (!r.ok) throw Error();
      const d = (await r.json()) as { requests: Order[]; hasMore: boolean };
      setRows(more ? [...rows, ...d.requests] : d.requests);
      setHasMore(d.hasMore);
      setError("");
    } catch {
      setError("Request history is temporarily unavailable. Please retry.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked.current || preparing) return;
    locked.current = true;
    setBusy(true);
    setMessage("");
    const form = e.currentTarget,
      v = Object.fromEntries(new FormData(form));
    try {
      const r = await fetch("/api/tenant/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          permissionToEnter: v.permissionToEnter === "yes",
          idempotencyKey: receipt.current,
          photos: await encodePhotos(files),
        }),
      });
      const d = (await r.json()) as {
        id: string;
        number: number;
        error?: string;
      };
      if (!r.ok) throw Error(d.error || "Unable to save your request.");
      setSuccess(d);
      form.reset();
      setFiles([]);
      receipt.current = crypto.randomUUID();
      setOpen(false);
      await refresh();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Unable to save. Please retry.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  const selected = assignments.find((a) => a.id === assignment);
  return (
    <>
      <button
        type="button"
        disabled={!assignments.length}
        className="mt-6 min-h-12 rounded bg-teams-gold px-5 py-3 font-semibold disabled:opacity-50"
        onClick={() => {
          setOpen(true);
          setSuccess(null);
          requestAnimationFrame(() =>
            formRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          );
        }}
      >
        Submit New Request
      </button>
      {!assignments.length && (
        <p>No authorized apartment is available. Contact management.</p>
      )}
      {success && (
        <section
          role="status"
          className="mt-5 rounded border border-green-700 bg-green-50 p-5"
        >
          <h2 className="text-xl font-semibold">
            Maintenance Request Submitted
          </h2>
          <p>
            Your maintenance request #{success.number} has been received. Teams
            Management will review your request.
          </p>
          <Link
            href={"/tenant/maintenance/" + success.id}
            className="mt-3 inline-flex min-h-11 items-center font-semibold underline"
          >
            Track your request
          </Link>
        </section>
      )}
      <form
        ref={formRef}
        onSubmit={submit}
        hidden={!open}
        className="mt-6 max-w-2xl space-y-5 rounded-lg border bg-white p-5"
      >
        <h2 className="text-xl font-semibold">New maintenance request</h2>
        <p className="text-sm text-slate-600">
          Most requests take about two minutes. Fields marked * are required.
        </p>
        <p>
          {tenant.display_name || "Your tenant account"} · {tenant.email}
        </p>
        <fieldset disabled={busy || preparing} className="space-y-5">
          <label className="block font-medium">
            Apartment *
            <select
              name="assignmentId"
              required
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
              className={field}
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · Apartment {a.unit_identifier}
                </option>
              ))}
            </select>
          </label>
          {selected && (
            <p className="text-sm text-slate-600">
              {address(selected.address_json) || selected.name}
            </p>
          )}
          <label className="block font-medium">
            Maintenance category *
            <select name="category" required defaultValue="" className={field}>
              <option value="" disabled>
                Select a category
              </option>
              {Object.entries(categories).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block font-medium">
            Problem description *
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={3000}
              rows={5}
              placeholder="Please describe the issue, where it is located, and when you first noticed it."
              className={field}
            />
          </label>
          <WorkOrderPhotos
            onPreparing={setPreparing}
            files={files}
            setFiles={setFiles}
            disabled={busy || preparing}
          />
          <fieldset>
            <legend className="font-medium">
              Permission to enter when you are absent *
            </legend>
            <div className="flex gap-6">
              <label className="inline-flex min-h-12 items-center gap-2">
                <input
                  type="radio"
                  name="permissionToEnter"
                  value="yes"
                  required
                />{" "}
                Yes
              </label>
              <label className="inline-flex min-h-12 items-center gap-2">
                <input
                  type="radio"
                  name="permissionToEnter"
                  value="no"
                  required
                />{" "}
                No
              </label>
            </div>
            <p className="text-sm text-slate-600">
              Your choice does not override applicable notice or access
              requirements.
            </p>
          </fieldset>
          <label className="block font-medium">
            Preferred contact method
            <select name="preferredContact" className={field}>
              <option value="email">Registered email</option>
              <option value="phone">
                Phone — provide number in access instructions
              </option>
            </select>
          </label>
          <label className="block font-medium">
            Additional access instructions (optional)
            <textarea
              name="accessInstructions"
              maxLength={1000}
              rows={3}
              className={field}
            />
          </label>
          <label className="block font-medium">
            Urgency
            <select name="urgency" className={field}>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent — not an emergency</option>
            </select>
          </label>
        </fieldset>
        <p role="alert" className="text-red-800">
          {message}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={busy || preparing}
            className="min-h-12 rounded bg-teams-gold px-5 py-3 font-semibold disabled:opacity-50"
          >
            {busy ? "Saving request…" : "Submit request"}
          </button>
          <button
            type="button"
            disabled={busy || preparing}
            className="min-h-12 rounded border px-5"
            onClick={() => {
              formRef.current?.reset();
              setFiles([]);
              setMessage("");
              receipt.current = crypto.randomUUID();
              setOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
      <section className="mt-10">
        <h2 className="text-2xl font-serif font-semibold">
          Maintenance Requests
        </h2>
        {loading ? (
          <p role="status" className="mt-4">
            Loading your requests…
          </p>
        ) : error ? (
          <div role="alert">
            <p>{error}</p>
            <button
              className="min-h-11 underline"
              onClick={() => void refresh()}
            >
              Retry loading history
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-3 text-slate-600">
            No maintenance requests yet. Use Submit New Request to get started.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {rows.map((r) => (
              <Link
                key={r.id}
                href={"/tenant/maintenance/" + r.id}
                className="block rounded-lg border bg-white p-5 hover:border-teams-gold focus-visible:outline focus-visible:outline-2"
              >
                <article>
                  <div className="flex flex-wrap justify-between gap-2">
                    <h3 className="font-semibold">
                      #{r.number} · {label(r.category, categories)}
                    </h3>
                    <span className="rounded bg-slate-100 px-3 py-1 text-sm font-semibold">
                      {label(r.status, statuses)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 break-words">
                    {r.description}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {r.property_name} · Apartment {r.unit_identifier}
                  </p>
                  <p className="text-sm text-slate-600">
                    Submitted {date(r.submitted_at)} · Updated{" "}
                    {date(r.updated_at)}
                  </p>
                  <span className="mt-2 inline-block underline">
                    View details and history
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}
        {hasMore && !loading && !error && (
          <button
            type="button"
            className="mt-4 min-h-12 rounded border px-5"
            onClick={() => void refresh(true)}
          >
            Load older requests
          </button>
        )}
      </section>
    </>
  );
}
