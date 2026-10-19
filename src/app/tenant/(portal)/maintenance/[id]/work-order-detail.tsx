"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Detail } from "@/lib/work-orders/shared";
import { WorkOrderActivity } from "@/components/WorkOrderActivity";
import { WorkOrderPhotos, encodePhotos } from "@/components/WorkOrderPhotos";
export function WorkOrderDetail({ id }: { id: string }) {
  const [data, setData] = useState<Detail | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [files, setFiles] = useState<File[]>([]),
    [busy, setBusy] = useState(false),
    [preparing, setPreparing] = useState(false);
  const receipt = useRef(crypto.randomUUID()),
    lock = useRef(false);
  async function load() {
    try {
      const r = await fetch("/api/tenant/maintenance/" + id, {
        cache: "no-store",
      });
      const d = (await r.json()) as Detail & { error?: string };
      if (!r.ok) throw Error(d.error || "Unable to load request.");
      setData(d);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
    const focus = () => {if(document.visibilityState==='visible')void load();};
    window.addEventListener("focus", focus);
    return () => {
      window.removeEventListener("focus", focus);
    };
  }, [id]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current || preparing) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    const form = e.currentTarget;
    try {
      const r = await fetch("/api/tenant/maintenance/" + id, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: receipt.current,
          body: new FormData(form).get("body"),
          photos: await encodePhotos(files),
        }),
      });
      const d = (await r.json()) as Detail & { error?: string };
      if (!r.ok) throw Error(d.error);
      receipt.current = crypto.randomUUID();
      form.reset();
      setFiles([]);
      setMessage("Your update was saved.");
      await load();
    } catch (e) {
      setMessage((e as Error).message || "Could not save. Please retry.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <Link
        href="/tenant/maintenance"
        className="inline-flex min-h-11 items-center underline"
      >
        Back to Maintenance Requests
      </Link>
      <h1 className="text-3xl font-serif font-semibold">Request details</h1>
      <button
        type="button"
        className="min-h-11 underline"
        onClick={() => void load()}
      >
        Refresh status
      </button>
      {error && <p role="alert">{error}</p>}
      {!data && !error && <p role="status">Loading request…</p>}
      {data && (
        <>
          <WorkOrderActivity data={data} />
          {!["closed","cancelled"].includes(data.request.status) ? (
            <form
              onSubmit={submit}
              className="mt-8 max-w-2xl space-y-4 rounded border bg-white p-5"
            >
              <h2 className="text-xl font-semibold">Add an update</h2>
              <p className="text-sm">
                Share more information or photos here to avoid creating a
                duplicate request.
              </p>
              <fieldset disabled={busy || preparing} className="space-y-4">
                <label className="block">
                  Additional information
                  <textarea
                    name="body"
                    maxLength={2000}
                    rows={4}
                    className="mt-1 w-full rounded border p-3"
                  />
                </label>
                <WorkOrderPhotos
                  onPreparing={setPreparing}
                  files={files}
                  setFiles={setFiles}
                  disabled={busy || preparing}
                />
              </fieldset>
              <button
                disabled={busy || preparing}
                className="min-h-12 rounded bg-teams-gold px-5 py-3 font-semibold disabled:opacity-50"
              >
                {busy ? "Saving update…" : "Save update"}
              </button>
              <p role="status">{message}</p>
            </form>
          ) : (
            <p className="mt-6">
              This request is closed. It remains available in your history.
            </p>
          )}
        </>
      )}
    </>
  );
}
