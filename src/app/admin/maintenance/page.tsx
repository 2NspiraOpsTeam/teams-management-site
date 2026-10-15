"use client";
import { useEffect, useRef, useState } from "react";
import {
  type Order,
  type Detail,
  statuses,
  categories,
  label,
  date,
} from "@/lib/work-orders/shared";
import { RequestAssignment } from "@/components/operations/RequestAssignment";
import { WorkOrderActivity } from "@/components/WorkOrderActivity";
const field = "w-full rounded border border-slate-300 bg-white p-3";
export default function MaintenanceAdmin() {
  const [rows, setRows] = useState<Order[]>([]),
    [data, setData] = useState<Detail | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [loading, setLoading] = useState(true),
    [page, setPage] = useState(0),
    [busy, setBusy] = useState(false),
    [truncated, setTruncated] = useState(false),
    [filters, setFilters] = useState({
      building: "",
      apartment: "",
      status: "",
      number: "",
    }),
    [buildings, setBuildings] = useState<{ id: string; name: string }[]>([]);
  const lock = useRef(false),
    form = useRef<HTMLFormElement>(null);
  async function list(nextPage = 0) {
    setLoading(true);
    try {
      const r = await fetch(
        "/api/admin/tenant-maintenance?" +
          new URLSearchParams({ ...filters, page: String(nextPage) }),
        { cache: "no-store" },
      );
      const d = (await r.json()) as {
        requests: Order[];
        truncated: boolean;
        error: string;
      };
      if (!r.ok) throw Error(d.error);
      setRows(d.requests);
      setPage(nextPage);
      setTruncated(d.truncated);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  async function open(id: string) {
    setMessage("");
    try {
      const r = await fetch("/api/admin/tenant-maintenance/" + id, {
          cache: "no-store",
        }),
        d = (await r.json()) as Detail & { error: string };
      if (!r.ok) throw Error(d.error);
      setData(d);
      setError("");
      requestAnimationFrame(() =>
        document.getElementById("request-detail")?.scrollIntoView(),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void list();
    const selected=new URL(location.href).searchParams.get("requestId");
    if(selected)void open(selected);
    void fetch("/api/admin/buildings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBuildings(Array.isArray(d) ? d : []))
      .catch(() => undefined);
  }, []);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data || lock.current) return;
    lock.current = true;
    setMessage("");
    setBusy(true);
    const v = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch(
          "/api/admin/tenant-maintenance/" + data.request.id,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...v, revision: data.request.revision }),
          },
        ),
        d = (await r.json()) as Detail & { error: string };
      if (!r.ok) throw Error(d.error);
      form.current?.reset();
      await open(data.request.id);
      await list(page);
      setMessage("Changes saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function retry(id: string) {
    if (!data || lock.current) return;
    lock.current = true;
    setMessage("");
    setBusy(true);
    try {
      const r = await fetch(
          "/api/admin/tenant-maintenance/" + data.request.id + "/retry",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId: id }),
          },
        ),
        d = (await r.json()) as Detail & { error: string };
      if (!r.ok) throw Error(d.error);
      await open(data.request.id);
      setMessage("Email retry processed. Check delivery status below.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-serif font-semibold">
        Maintenance Requests
      </h1>
      <p className="mt-2">
        Review tenant requests, keep internal notes private, and share progress.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void list();
        }}
        className="my-6 grid gap-3 rounded border bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label>
          Building
          <select
            className={field}
            value={filters.building}
            onChange={(e) =>
              setFilters({ ...filters, building: e.target.value })
            }
          >
            <option value="">All buildings</option>
            {buildings.map((b) => (
              <option value={b.id} key={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Apartment
          <input
            className={field}
            maxLength={100}
            value={filters.apartment}
            onChange={(e) =>
              setFilters({ ...filters, apartment: e.target.value })
            }
          />
        </label>
        <label>
          Status
          <select
            className={field}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All statuses</option>
            {Object.entries(statuses).map(([v, l]) => (
              <option value={v} key={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          Work-order number
          <input
            className={field}
            inputMode="numeric"
            value={filters.number}
            onChange={(e) =>
              setFilters({
                ...filters,
                number: e.target.value.replace(/[^0-9]/g, ""),
              })
            }
          />
        </label>
        <button
          disabled={loading || busy}
          className="min-h-12 self-end rounded bg-teams-gold p-3 font-semibold"
        >
          Apply filters
        </button>
      </form>
      {error && (
        <p role="alert" className="my-4 rounded bg-red-50 p-4 text-red-900">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading requests…</p>
      ) : (
        <>
          <p className="mb-3">
            {rows.length} requests
            {truncated ? " — more results available on the next page" : ""}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {rows.map((r) => (
              <button
                type="button"
                key={r.id}
                disabled={busy}
                onClick={() => void open(r.id)}
                className="min-w-0 rounded border bg-white p-5 text-left hover:border-teams-gold"
              >
                <span className="font-semibold">
                  #{r.number} · {label(r.category, categories)}
                </span>
                <span className="ml-2 inline-block rounded bg-slate-100 px-2 py-1 text-sm">
                  {label(r.status, statuses)}
                </span>
                <p className="mt-2">
                  {r.property_name} · Apartment {r.unit_identifier}
                </p>
                <p className="break-words text-sm">
                  {r.display_name || r.email}
                </p>
                <p className="mt-2 line-clamp-2 break-words">{r.description}</p>
                <p className="mt-2 text-sm">Updated {date(r.updated_at)}</p>
              </button>
            ))}
          </div>
          {!rows.length && <p>No requests match these filters.</p>}
          <div className="mt-4 flex gap-4">
            <button
              type="button"
              disabled={loading || page === 0}
              className="min-h-12 rounded border px-4 disabled:opacity-50"
              onClick={() => void list(page - 1)}
            >
              Previous page
            </button>
            <span className="self-center">Page {page + 1}</span>
            <button
              type="button"
              disabled={loading || !truncated}
              className="min-h-12 rounded border px-4 disabled:opacity-50"
              onClick={() => void list(page + 1)}
            >
              Next page
            </button>
          </div>
        </>
      )}
      {data && (
        <section id="request-detail" className="mt-10 scroll-mt-4">
          <button
            className="min-h-11 underline"
            onClick={() => void open(data.request.id)}
          >
            Reload request
          </button>
          <p className="break-words">
            Tenant: {data.request.display_name || "Name not recorded"} ·{" "}
            {data.request.email}
          </p>
          <p role="status">{message}</p>
          <WorkOrderActivity data={data} admin />
          <RequestAssignment request={data.request} onSaved={()=>void open(data.request.id)}/>
          <form
            ref={form}
            key={data.request.revision}
            onSubmit={save}
            className="mt-6 max-w-2xl space-y-4 rounded border bg-white p-5"
          >
            <h2 className="text-xl font-semibold">Manage request</h2>
            <fieldset disabled={busy} className="space-y-4">
              <label className="block">
                Status
                <select
                  name="status"
                  defaultValue={data.request.status}
                  className={field}
                >
                  {Object.entries(statuses).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                Tenant-visible update (optional)
                <textarea
                  name="tenantUpdate"
                  maxLength={2000}
                  rows={3}
                  className={field}
                />
              </label>
              <label className="block">
                Internal note — never shown to tenants
                <textarea
                  name="internalNote"
                  maxLength={5000}
                  rows={3}
                  className={field}
                />
              </label>
            </fieldset>
            <button
              disabled={busy}
              className="min-h-12 rounded bg-teams-gold px-5 py-3 font-semibold disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </form>
          <h2 className="mt-8 text-xl font-semibold">Email delivery</h2>
          <p className="text-sm">
            Pending or failed deliveries can be retried. Sending or unknown
            outcomes require provider review to avoid duplicate email.
          </p>
          <ul className="mt-3 space-y-2">
            {data.notifications?.map((n) => (
              <li className="rounded border bg-white p-3" key={n.id}>
                {n.audience}: {n.state} · {n.attempts} attempts{" "}
                {n.error_code && <span>({n.error_code})</span>}
                {["pending", "failed"].includes(n.state) && n.attempts < 5 && (
                  <button
                    disabled={busy}
                    type="button"
                    className="ml-3 min-h-11 underline"
                    onClick={() => void retry(n.id)}
                  >
                    Retry email
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
