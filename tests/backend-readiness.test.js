import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
const state = vi.hoisted(() => ({
  env: {},
  cookies: new Map(),
  mail: [],
  failMail: false,
  jobs: [],
}));
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => ({
    env: state.env,
    ctx: { waitUntil: (p) => state.jobs.push(p) },
  }),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name) =>
      state.cookies.has(name) ? { value: state.cookies.get(name) } : undefined,
  }),
}));
vi.mock("../src/lib/mail-service", () => ({
  MailService: class {
    configured() {
      return true;
    }
    async sendAdminOtp(email, code) {
      if (state.failMail) throw Error("mail");
      state.mail.push({ email, code });
      return "local-mail";
    }
    async sendTenantOtp(email, code) {
      if (state.failMail) throw Error("mail");
      state.mail.push({ email, code });
      return "local-mail";
    }
    async sendInquiryNotification(to, id, qa) {
      state.mail.push({
        to,
        id,
        qa,
        persisted: Boolean(
          await state.env.DB.prepare("SELECT id FROM inquiries WHERE id=?")
            .bind(id)
            .first(),
        ),
      });
      if (state.failMail) throw Error("gmail_send_http_403");
      return "local-mail";
    }
  },
}));
vi.mock("../src/lib/gmail-provider", () => ({
  gmailConfigured: () => true,
  sendGmail: async (_env, from, to, subject, body) => {
    state.mail.push({
      from,
      to,
      subject,
      body,
      workOrder: true,
      persisted:
        sql
          .prepare("SELECT COUNT(*) AS n FROM tenant_maintenance_requests")
          .get().n > 0,
    });
    if (state.failMail) throw Error("gmail_send_http_403");
    return "work-order-provider-id";
  },
}));
import * as orderDetail from "../src/app/api/tenant/maintenance/[id]/route";
import * as adminOrders from "../src/app/api/admin/tenant-maintenance/route";
import * as adminOrderDetail from "../src/app/api/admin/tenant-maintenance/[id]/route";
import * as tenantPhotos from "../src/app/api/tenant/maintenance/photos/[id]/route";
import * as adminPhotos from "../src/app/api/admin/tenant-maintenance/photos/[id]/route";
import * as retryNotice from "../src/app/api/admin/tenant-maintenance/[id]/retry/route";
import * as admin from "../src/lib/admin-code-session";
import * as passwords from "../src/app/api/admin/password/route";
import * as tenant from "../src/lib/tenant-code-session";
import * as maintenance from "../src/app/api/tenant/maintenance/route";
import * as contact from "../src/app/api/contact/route";
import * as reports from "../src/app/api/buildings/data-report/route";
import * as uploads from "../src/app/api/admin/media/route";
import { hash, currentAdmin } from "../src/lib/admin-auth";
import { currentTenant } from "../src/lib/tenant-auth";
import { mediaResponse } from "../src/lib/media-response";
import { boundedBody, BodyTooLarge } from "../src/lib/request-body";
let sql, db;
const origin = "https://qa.example";
const post = (path, input, headers = {}) =>
  new Request(origin + path, {
    method: "POST",
    headers: { origin, "content-type": "application/json", ...headers },
    body: JSON.stringify(input),
  });
function adapter(sql) {
  return {
    prepare(query) {
      let args = [];
      const p = {
        bind(...values) {
          args = values;
          return p;
        },
        async first() {
          return sql.prepare(query).get(...args) || null;
        },
        async all() {
          return { results: sql.prepare(query).all(...args) };
        },
        async run() {
          const r = sql.prepare(query).run(...args);
          return { meta: { changes: Number(r.changes) } };
        },
      };
      return p;
    },
    async batch(statements) {
      sql.exec("BEGIN");
      try {
        const r = [];
        for (const s of statements) r.push(await s.run());
        sql.exec("COMMIT");
        return r;
      } catch (e) {
        sql.exec("ROLLBACK");
        throw e;
      }
    },
  };
}
beforeEach(() => {
  sql = new DatabaseSync(":memory:");
  for (const file of [
    "schema.sql",
    "admin-phase1.sql",
    "admin-otp.sql",
    "admin-passwords.sql",
    "remembered-browsers.sql",
    "tenant-portal.sql",
    "work-orders-mvp.sql",
    "property-operations.sql",
    "add-inquiry-details.sql",
    "rental-inquiry-handoff.sql",
  ])
    sql.exec(readFileSync("src/lib/migrations/" + file, "utf8"));
  sql.exec(
    readFileSync("src/lib/migrations/media-management.sql", "utf8").split(
      /^INSERT /m,
    )[0],
  );
  sql.exec(
    "INSERT INTO buildings(id,name,slug,address_json,publication_state) VALUES ('b1','QA One','qa-one','{}','published'),('b2','QA Two','qa-two','{}','draft'); INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES ('u1','b1','1',1),('u2','b2','2',2); INSERT INTO tenant_accounts(id,email,active) VALUES ('t1','one@example.test',1),('t2','two@example.test',1); INSERT INTO tenant_assignments(id,tenant_id,building_id,unit_id) VALUES ('a1','t1','b1','u1'),('a2','t2','b2','u2'); INSERT INTO admin_identities(email) VALUES ('qa-admin@example.test'); CREATE TABLE dining_venues (id TEXT,property_id TEXT,hero_media_asset_id TEXT,publication_state TEXT); CREATE TABLE dining_venue_photos (venue_id TEXT,asset_id TEXT);",
  );
  db = adapter(sql);
  state.env = {
    DB: db,
    ADMIN_OTP_PEPPER: "a".repeat(32),
    TENANT_OTP_PEPPER: "t".repeat(32),
    ADMIN_AUTH_FROM: "qa@example.test",
    TENANT_AUTH_FROM: "qa@example.test",
  };
  state.cookies.clear();
  state.mail = [];
  state.jobs = [];
  state.failMail = false;
});
afterEach(() => sql.close());
async function signIn(module, email, cookie) {
  expect(
    (await module.POST(post("/session", { action: "request", email }))).status,
  ).toBe(200);
  const code = state.mail.at(-1).code;
  const response = await module.POST(
    post("/session", { action: "verify", email, code }),
  );
  expect(response.status).toBe(200);
  const header = response.headers.get("set-cookie");
  expect(header).toMatch(/HttpOnly/i);
  expect(header).toMatch(/Secure/i);
  expect(header).toMatch(/SameSite=strict/i);
  if (cookie === "teams_admin_session") expect(header).toMatch(/Max-Age=86400/i);
  state.cookies.set(cookie, header.split(";")[0].split("=")[1]);
  return code;
}

describe("local SQLite-backed auth, isolation and persistence (mail stubbed)", () => {
  it("Admin persists beyond eight hours, expires after 24 hours, and logout revokes access", async () => {
    await signIn(admin, "qa-admin@example.test", "teams_admin_session");
    const remaining = sql.prepare("SELECT (julianday(expires_at)-julianday('now'))*24 AS hours FROM admin_sessions").get().hours;
    expect(remaining).toBeGreaterThan(23.99);
    expect(remaining).toBeLessThanOrEqual(24);
    sql.exec("UPDATE admin_sessions SET expires_at=datetime('now','+15 hours'),created_at=datetime('now','-9 hours')");
    expect(await currentAdmin()).toBe("qa-admin@example.test");
    sql.exec("UPDATE admin_sessions SET expires_at=datetime('now','-1 second')");
    expect(await currentAdmin()).toBeNull();
    sql.exec("UPDATE admin_sessions SET expires_at=datetime('now','+1 hour')");
    const response = await admin.DELETE(new Request(origin + "/session", {method:"DELETE",headers:{origin,cookie:"teams_admin_session="+state.cookies.get("teams_admin_session")}}));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
    expect(await currentAdmin()).toBeNull();
  });
  it("Admin OTP is single-use and does not grant tenant access", async () => {
    const code = await signIn(
      admin,
      "qa-admin@example.test",
      "teams_admin_session",
    );
    expect(await currentAdmin()).toBe("qa-admin@example.test");
    expect(await currentTenant()).toBeNull();
    expect(
      (
        await admin.POST(
          post("/session", {
            action: "verify",
            email: "qa-admin@example.test",
            code,
          }),
        )
      ).status,
    ).toBe(401);
  });
  it("Tenant OTP cannot grant Admin access; deactivation invalidates a live session", async () => {
    await signIn(tenant, "one@example.test", "teams_tenant_session");
    expect((await currentTenant()).id).toBe("t1");
    expect(await currentAdmin()).toBeNull();
    sql.exec("UPDATE tenant_accounts SET active=0 WHERE id='t1'");
    expect(await currentTenant()).toBeNull();
  });
  it("rejects expired codes and locks after five wrong attempts", async () => {
    await tenant.POST(
      post("/session", { action: "request", email: "one@example.test" }),
    );
    const code = state.mail.at(-1).code;
    for (let i = 0; i < 5; i++)
      expect(
        (
          await tenant.POST(
            post("/session", {
              action: "verify",
              email: "one@example.test",
              code: code === "00000000" ? "11111111" : "00000000",
            }),
          )
        ).status,
      ).toBe(401);
    expect(
      (
        await tenant.POST(
          post("/session", {
            action: "verify",
            email: "one@example.test",
            code,
          }),
        )
      ).status,
    ).toBe(401);
    sql.exec(
      "UPDATE tenant_login_codes SET attempt_count=0,expires_at=datetime('now','-1 minute')",
    );
    expect(
      (
        await tenant.POST(
          post("/session", {
            action: "verify",
            email: "one@example.test",
            code,
          }),
        )
      ).status,
    ).toBe(401);
  });
  it("revokes logout sessions and rejects foreign Origin", async () => {
    await signIn(tenant, "one@example.test", "teams_tenant_session");
    expect(
      (
        await tenant.POST(
          post("/session", {}, { origin: "https://foreign.example" }),
        )
      ).status,
    ).toBe(401);
    await tenant.DELETE(
      new Request(origin + "/session", {
        method: "DELETE",
        headers: {
          origin,
          cookie:
            "teams_tenant_session=" + state.cookies.get("teams_tenant_session"),
        },
      }),
    );
    expect(await currentTenant()).toBeNull();
  });
  it("fails closed on missing pepper and mail failure; failed code cannot be used", async () => {
    state.env.TENANT_OTP_PEPPER = "";
    expect(
      (
        await tenant.POST(
          post("/session", { action: "request", email: "one@example.test" }),
        )
      ).status,
    ).toBe(503);
    state.env.TENANT_OTP_PEPPER = "t".repeat(32);
    state.failMail = true;
    expect(
      (
        await tenant.POST(
          post("/session", { action: "request", email: "one@example.test" }),
        )
      ).status,
    ).toBe(503);
    expect(
      sql.prepare("SELECT used_at FROM tenant_login_codes").get().used_at,
    ).toBeTruthy();
  });
  it("denies diagnostic reports and uploads without a verified Admin", async () => {
    expect((await reports.GET()).status).toBe(401);
    expect((await uploads.POST(post("/upload", {}))).status).toBe(401);
    state.cookies.set("teams_admin_session", "0".repeat(64));
    expect((await reports.GET()).status).toBe(401);
  });
  it("maintenance persists once across retries, is audited, hides staff notes and rejects cross-tenant assignment", async () => {
    await signIn(tenant, "one@example.test", "teams_tenant_session");
    const input = {
      idempotencyKey: crypto.randomUUID(),
      assignmentId: "a1",
      category: "plumbing",
      description: "QA only: leaking faucet",
      urgency: "routine",
      preferredContact: "email",
      permissionToEnter: false,
    };
    expect((await maintenance.POST(post("/maintenance", input))).status).toBe(
      201,
    );
    expect((await maintenance.POST(post("/maintenance", input))).status).toBe(
      200,
    );
    expect(
      sql.prepare("SELECT COUNT(*) AS n FROM tenant_maintenance_requests").get()
        .n,
    ).toBe(1);
    expect(
      sql
        .prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='submitted'")
        .get().n,
    ).toBe(1);
    expect(
      (
        await maintenance.POST(
          post("/maintenance", {
            ...input,
            description: "Changed body cannot reuse receipt",
          }),
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await maintenance.POST(
          post("/maintenance", {
            ...input,
            idempotencyKey: crypto.randomUUID(),
            assignmentId: "a2",
          }),
        )
      ).status,
    ).toBe(403);
    const history = await (await maintenance.GET()).json();
    expect(history.requests).toHaveLength(1);
    expect(history.requests[0]).not.toHaveProperty("staff_notes");
    await signIn(tenant, "two@example.test", "teams_tenant_session");
    expect((await (await maintenance.GET()).json()).requests).toEqual([]);
  });
  it("contact validates malformed/oversized requests; saves atomically and suppresses duplicate retries", async () => {
    expect(
      (
        await contact.POST(
          new Request(origin + "/contact", {
            method: "POST",
            headers: { origin, "content-type": "application/json" },
            body: "{",
          }),
        )
      ).status,
    ).toBe(400);
    expect(
      (await contact.POST(post("/contact", { message: "x".repeat(13000) })))
        .status,
    ).toBe(413);
    const input = {
      idempotencyKey: crypto.randomUUID(),
      category: "property",
      name: "QA Test",
      email: "qa@example.test",
      phone: "2125550100",
      propertyInterest: "QA One",
      message: "QA integration inquiry only",
    };
    expect((await contact.POST(post("/contact", input))).status).toBe(201);
    expect((await contact.POST(post("/contact", input))).status).toBe(200);
    await Promise.all(state.jobs);
    expect(
      sql.prepare("SELECT COUNT(*) AS n FROM inquiry_details").get().n,
    ).toBe(1);
    expect(
      sql.prepare("SELECT state,error_code FROM inquiry_notifications").get(),
    ).toMatchObject({ state: "pending", error_code: "configuration_pending" });
    expect(
      (
        await contact.POST(
          post("/contact", {
            ...input,
            building: "qa-two",
            idempotencyKey: crypto.randomUUID(),
          }),
        )
      ).status,
    ).toBe(400);
  });
  it("D1-first notification records Gmail outcome and suppresses retry/concurrent duplication", async () => {
    state.env.INQUIRY_FROM = "sender@example.test";
    state.env.INQUIRY_NOTIFY_TO = "destination@example.test";
    state.env.INQUIRY_QA_TO = "qa@example.test";
    const id = crypto.randomUUID();
    state.env.INQUIRY_QA_ID = id;
    const input = {
      idempotencyKey: id,
      category: "general",
      name: "QA Test",
      email: "qa@example.test",
      message: "Approved preview QA test only",
    };
    const response = await contact.POST(post("/contact", input));
    expect(response.status).toBe(201);
    expect(sql.prepare("SELECT id FROM inquiries WHERE id=?").get(id).id).toBe(
      id,
    );
    await Promise.all(state.jobs);
    expect(state.mail).toEqual([
      {
        to: "destination@example.test, qa@example.test",
        id,
        qa: true,
        persisted: true,
      },
    ]);
    expect(
      sql
        .prepare(
          "SELECT state,attempts,provider_id,destination FROM inquiry_notifications",
        )
        .get(),
    ).toMatchObject({
      state: "sent",
      attempts: 1,
      provider_id: "local-mail",
      destination: "destination@example.test, qa@example.test",
    });
    expect((await contact.POST(post("/contact", input))).status).toBe(200);
    const { attemptInquiryNotification } =
      await import("../src/lib/inquiry-notifications");
    await Promise.all([
      attemptInquiryNotification(db, state.env, id),
      attemptInquiryNotification(db, state.env, id),
    ]);
    expect(state.mail).toHaveLength(1);
  });
  it("Gmail failure cannot reverse visitor success and does not resend on retry", async () => {
    state.env.INQUIRY_FROM = "sender@example.test";
    state.env.INQUIRY_NOTIFY_TO = "destination@example.test";
    state.failMail = true;
    const input = {
      idempotencyKey: crypto.randomUUID(),
      category: "general",
      name: "QA Test",
      email: "qa@example.test",
      message: "Approved failure injection test",
    };
    expect((await contact.POST(post("/contact", input))).status).toBe(201);
    await Promise.all(state.jobs);
    expect(
      sql
        .prepare("SELECT state,attempts,error_code FROM inquiry_notifications")
        .get(),
    ).toMatchObject({
      state: "failed",
      attempts: 1,
      error_code: "gmail_send_http_403",
    });
    expect((await contact.POST(post("/contact", input))).status).toBe(200);
    expect(state.mail).toHaveLength(1);
    expect(state.mail[0].qa).toBe(false);
  });
  it("private/unpublished media returns 404 and static redirects stay same-origin", async () => {
    sql.exec(
      "INSERT INTO media_assets(id,storage_key,file_type,visibility) VALUES ('private','preview-d1/private','image/jpeg','internal'),('static','/preview-properties/approved.jpg','image/jpeg','public'); INSERT INTO media_assignments(id,asset_id,building_id) VALUES ('m1','static','b1'); INSERT INTO media_publications(assignment_id,published) VALUES ('m1',1)",
    );
    expect((await mediaResponse(db, "private", false)).status).toBe(404);
    const response = await mediaResponse(db, "static", false);
    expect(response.headers.get("location")).toBe(
      "/preview-properties/approved.jpg",
    );
    const version='a'.repeat(64);
    sql.prepare("UPDATE media_assets SET checksum=? WHERE id='static'").run(version);
    expect((await mediaResponse(db,"static",false,false,version)).status).toBe(302);
    expect((await mediaResponse(db,"static",false,false,'b'.repeat(64))).status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('public, max-age=60, must-revalidate');
    expect((await mediaResponse(db,"static",true)).headers.get('cache-control')).not.toContain('public');
    sql.exec("UPDATE media_publications SET published=0");
    expect((await mediaResponse(db, "static", false)).status).toBe(404);
  });
  it("bounds streamed bodies even without Content-Length", async () => {
    const request = new Request(origin, {
      method: "POST",
      body: new ReadableStream({
        start(c) {
          c.enqueue(new Uint8Array(9));
          c.enqueue(new Uint8Array(9));
          c.close();
        },
      }),
      duplex: "half",
    });
    await expect(boundedBody(request, 12)).rejects.toBeInstanceOf(BodyTooLarge);
  });
});

it("every Admin API handler enforces session authorization and mutations reject foreign Origin", async () => {
  const modules = import.meta.glob("../src/app/api/admin/**/route.ts");
  let checked = 0;
  for (const [path, load] of Object.entries(modules)) {
    if (path.endsWith("/session/route.ts")) continue;
    const handlers = await load();
    for (const method of ["GET", "POST", "PATCH", "PUT", "DELETE"]) {
      if (typeof handlers[method] !== "function") continue;
      if (path.endsWith("/admin/password/route.ts") && method === "POST") continue; // Public sign-in only; GET/PUT still require sessions.
      const request = new Request(origin + "/api/admin/qa", {
        method,
        headers: {
          origin,
          ...(method === "GET" ? {} : { "content-type": "application/json" }),
        },
        ...(method === "GET" ? {} : { body: "{}" }),
      });
      expect(
        (
          await handlers[method](request, {
            params: Promise.resolve({ id: "qa" }),
          })
        ).status,
        `${path} ${method}`,
      ).toBe(401);
      checked++;
    }
  }
  expect(checked).toBeGreaterThan(30);
  await signIn(admin, "qa-admin@example.test", "teams_admin_session");
  for (const [path, load] of Object.entries(modules)) {
    if (path.endsWith("/session/route.ts")) continue;
    const handlers = await load();
    for (const method of ["POST", "PATCH", "PUT", "DELETE"])
      if (typeof handlers[method] === "function") {
        const request = new Request(origin + "/api/admin/qa", {
          method,
          headers: {
            origin: "https://foreign.example",
            "content-type": "application/json",
          },
          body: "{}",
        });
        expect([401, 403]).toContain(
          (
            await handlers[method](request, {
              params: Promise.resolve({ id: "qa" }),
            })
          ).status,
        );
      }
  }
});

it("preview media allowances cannot override an archived property", async () => {
  sql.exec(
    "UPDATE buildings SET slug='61-gold-st',publication_state='archived' WHERE id='b1'; INSERT INTO media_assets(id,storage_key,file_type,visibility) VALUES ('archived-property-photo','/preview-properties/approved.jpg','image/jpeg','public'); INSERT INTO media_assignments(id,asset_id,building_id) VALUES ('archived-photo','archived-property-photo','b1'); INSERT INTO media_publications(assignment_id,published) VALUES ('archived-photo',1)",
  );
  expect(
    (await mediaResponse(db, "archived-property-photo", false, true)).status,
  ).toBe(404);
});

const ctx = (id) => ({ params: Promise.resolve({ id }) });
const png = {
  mime: "image/png",
  data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
};
async function createOrder(extra = {}) {
  if ((await currentTenant())?.id !== "t1")
    await signIn(tenant, "one@example.test", "teams_tenant_session");
  const values = {
    idempotencyKey: crypto.randomUUID(),
    assignmentId: "a1",
    category: "pest-control",
    description: "QA only: issue near the window",
    urgency: "routine",
    preferredContact: "email",
    permissionToEnter: false,
    accessInstructions: "Please call first",
    ...extra,
  };
  const response = await maintenance.POST(post("/maintenance", values));
  expect(response.status).toBe(201);
  return { values, ...(await response.json()) };
}
async function drain() {
  await Promise.all(state.jobs);
  state.jobs = [];
}
describe("work-order full lifecycle and failure safety (real SQLite, mail stubbed)", () => {
  it("saves photos, receipts, consent and chronological history; denies cross-account details and photos", async () => {
    const order = await createOrder({ photos: [png, png] });
    await drain();
    let response = await orderDetail.GET(new Request(origin), ctx(order.id));
    expect(response.status).toBe(200);
    const d = await response.json();
    expect(d.request).toMatchObject({
      number: order.number,
      permission_to_enter: 0,
      access_instructions: "Please call first",
      revision: 1,
    });
    expect(d.photos).toHaveLength(2);
    expect(d.events).toHaveLength(1);
    expect(d.request).not.toHaveProperty("staff_notes");
    const image = await tenantPhotos.GET(
      new Request(origin),
      ctx(d.photos[0].id),
    );
    expect(image.status).toBe(200);
    expect(image.headers.get("cache-control")).toContain("no-store");
    expect(image.headers.get("x-content-type-options")).toBe("nosniff");
    await signIn(tenant, "two@example.test", "teams_tenant_session");
    expect(
      (await orderDetail.GET(new Request(origin), ctx(order.id))).status,
    ).toBe(404);
    expect(
      (await tenantPhotos.GET(new Request(origin), ctx(d.photos[0].id))).status,
    ).toBe(404);
    expect(
      (
        await orderDetail.POST(
          post("/update", {
            idempotencyKey: crypto.randomUUID(),
            body: "Not my request",
          }),
          ctx(order.id),
        )
      ).status,
    ).toBe(404);
    state.cookies.clear();
    expect(
      (await tenantPhotos.GET(new Request(origin), ctx(d.photos[0].id))).status,
    ).toBe(401);
    expect(
      (await adminPhotos.GET(new Request(origin), ctx(d.photos[0].id))).status,
    ).toBe(401);
  });
  it("admin status, public updates and internal notes are atomic, attributed, private and revision-protected", async () => {
    const order = await createOrder();
    await drain();
    await signIn(admin, "qa-admin@example.test", "teams_admin_session");
    const patch = (v) =>
      adminOrderDetail.PATCH(
        new Request(origin + "/order", {
          method: "PATCH",
          headers: { origin, "content-type": "application/json" },
          body: JSON.stringify(v),
        }),
        ctx(order.id),
      );
    expect(
      (
        await patch({
          status: "in_review",
          revision: 1,
          internalNote: "PRIVATE office note",
          tenantUpdate: "We are reviewing this.",
        })
      ).status,
    ).toBe(200);
    await drain();
    const adminData = await (
      await adminOrderDetail.GET(new Request(origin), ctx(order.id))
    ).json();
    expect(
      adminData.events.some(
        (e) =>
          e.visibility === "internal" && e.actor_id === "qa-admin@example.test",
      ),
    ).toBe(true);
    expect((await patch({ status: "scheduled", revision: 1 })).status).toBe(
      409,
    );
    let tenantData = await (
      await orderDetail.GET(new Request(origin), ctx(order.id))
    ).json();
    expect(tenantData.request.status).toBe("in_review");
    expect(JSON.stringify(tenantData)).not.toContain("PRIVATE");
    expect(tenantData.events).toHaveLength(2);
    expect((await patch({ status: "scheduled", revision: 2 })).status).toBe(
      200,
    );
    await drain();
    expect((await patch({ status: "completed", revision: 3 })).status).toBe(
      200,
    );
    await drain();
    expect((await patch({ status: "closed", revision: 4 })).status).toBe(200);
    await drain();
    tenantData = await (
      await orderDetail.GET(new Request(origin), ctx(order.id))
    ).json();
    expect(tenantData.request.completed_at).toBeTruthy();
    expect(tenantData.request.status).toBe("closed");
    expect(tenantData.events.map((e) => e.status)).toEqual([
      "submitted",
      "in_review",
      "scheduled",
      "completed",
      "closed",
    ]);
    expect((await maintenance.GET()).status).toBe(200);
    expect(
      (
        await orderDetail.POST(
          post("/update", {
            idempotencyKey: crypto.randomUUID(),
            body: "extra information",
          }),
          ctx(order.id),
        )
      ).status,
    ).toBe(409);
    const list = await (
      await adminOrders.GET(
        new Request(
          origin +
            "/orders?number=" +
            order.number +
            "&status=closed&building=b1&apartment=1",
        ),
      )
    ).json();
    expect(list.requests).toHaveLength(1);
    expect(
      sql
        .prepare(
          "SELECT COUNT(*) AS n FROM audit_log WHERE user_actor='qa-admin@example.test'",
        )
        .get().n,
    ).toBe(4);
  });
  it("tenant can add information and extra photos once, with receipt conflict and per-request limits", async () => {
    const order = await createOrder();
    await drain();
    const update = {
      idempotencyKey: crypto.randomUUID(),
      body: "The issue is now worse",
      photos: [png],
    };
    expect(
      (await orderDetail.POST(post("/update", update), ctx(order.id))).status,
    ).toBe(201);
    await drain();
    expect(
      (await orderDetail.POST(post("/update", update), ctx(order.id))).status,
    ).toBe(200);
    expect(
      (
        await orderDetail.POST(
          post("/update", { ...update, body: "Changed content" }),
          ctx(order.id),
        )
      ).status,
    ).toBe(409);
    const d = await (
      await orderDetail.GET(new Request(origin), ctx(order.id))
    ).json();
    expect(d.photos).toHaveLength(1);
    expect(d.events).toHaveLength(2);
    expect(d.request.revision).toBe(2);
  });
  it("rejects bad uploads, omitted consent, invalid categories and oversized descriptions without partial records", async () => {
    await signIn(tenant, "one@example.test", "teams_tenant_session");
    const base = {
      idempotencyKey: crypto.randomUUID(),
      assignmentId: "a1",
      category: "plumbing",
      description: "Valid description here",
      urgency: "routine",
      preferredContact: "email",
      permissionToEnter: false,
    };
    for (const delta of [
      { photos: [{ mime: "image/svg+xml", data: btoa("<svg>bad</svg>") }] },
      { photos: [{ mime: "image/png", data: btoa("not an image at all") }] },
      { photos: [png, png, png, png, png] },
      { permissionToEnter: null },
      { category: "unknown" },
      { description: "x".repeat(3001) },
    ])
      expect(
        (await maintenance.POST(post("/maintenance", { ...base, ...delta })))
          .status,
      ).toBe(400);
    expect(
      sql.prepare("SELECT COUNT(*) AS n FROM tenant_maintenance_requests").get()
        .n,
    ).toBe(0);
    expect(
      sql.prepare("SELECT COUNT(*) AS n FROM work_order_photos").get().n,
    ).toBe(0);
  });
  it("queues delivery after persistence; failure does not erase success; safe retry claims prevent duplicates", async () => {
    state.env.WORK_ORDER_NOTIFY_TO = "office@example.test";
    const o = await createOrder();
    await drain();
    let sent = state.mail.filter((m) => m.workOrder);
    expect(sent).toHaveLength(2);
    expect(sent.every((m) => m.persisted)).toBe(true);
    expect(sent.map((m) => m.to)).toEqual([
      "office@example.test",
      "one@example.test",
    ]);
    expect(sent.every((m) => !m.body.includes("Please call first"))).toBe(true);
    const { deliver } = await import("../src/lib/work-orders/notifications");
    const notices = sql
      .prepare("SELECT id,state FROM work_order_notifications")
      .all();
    expect(notices.every((n) => n.state === "sent")).toBe(true);
    await deliver(db, state.env, notices[0].id);
    expect(state.mail.filter((m) => m.workOrder)).toHaveLength(2);
    state.failMail = true;
    const failed = await createOrder();
    await drain();
    expect(
      sql.prepare("SELECT COUNT(*) AS n FROM tenant_maintenance_requests").get()
        .n,
    ).toBe(2);
    expect(
      sql
        .prepare(
          "SELECT state FROM work_order_notifications WHERE request_id=?",
        )
        .all(failed.id)
        .every((n) => n.state === "failed"),
    ).toBe(true);
    state.failMail = false;
    await signIn(admin, "qa-admin@example.test", "teams_admin_session");
    const n = sql
      .prepare(
        "SELECT id FROM work_order_notifications WHERE request_id=? LIMIT 1",
      )
      .get(failed.id);
    expect(
      (
        await retryNotice.POST(
          post("/retry", { notificationId: n.id }),
          ctx(failed.id),
        )
      ).status,
    ).toBe(200);
    expect(
      sql
        .prepare(
          "SELECT state,attempts FROM work_order_notifications WHERE id=?",
        )
        .get(n.id),
    ).toMatchObject({ state: "sent", attempts: 2 });
    sql
      .prepare("UPDATE work_order_notifications SET state='unknown' WHERE id=?")
      .run(n.id);
    expect(
      (
        await retryNotice.POST(
          post("/retry", { notificationId: n.id }),
          ctx(failed.id),
        )
      ).status,
    ).toBe(409);
  });
  it("missing mail configuration remains visible; private-only notes never queue tenant email", async () => {
    const o = await createOrder();
    await drain();
    expect(
      sql
        .prepare(
          "SELECT state,error_code FROM work_order_notifications WHERE audience='management'",
        )
        .get(),
    ).toMatchObject({ state: "pending", error_code: "configuration_pending" });
    await signIn(admin, "qa-admin@example.test", "teams_admin_session");
    const before = sql
      .prepare("SELECT COUNT(*) AS n FROM work_order_notifications")
      .get().n;
    expect(
      (
        await adminOrderDetail.PATCH(
          new Request(origin + "/order", {
            method: "PATCH",
            headers: { origin, "content-type": "application/json" },
            body: JSON.stringify({
              status: "submitted",
              revision: 1,
              internalNote: "Office only",
            }),
          }),
          ctx(o.id),
        )
      ).status,
    ).toBe(200);
    expect(
      sql.prepare("SELECT COUNT(*) AS n FROM work_order_notifications").get().n,
    ).toBe(before);
    expect(
      JSON.stringify(
        await (await orderDetail.GET(new Request(origin), ctx(o.id))).json(),
      ),
    ).not.toContain("Office only");
  });
  it("a failed atomic write cannot create false submission success or leave partial children", async () => {
    await signIn(tenant, "one@example.test", "teams_tenant_session");
    sql.exec(
      "CREATE TRIGGER qa_fail_outbox BEFORE INSERT ON work_order_notifications BEGIN SELECT RAISE(ABORT,'qa failure'); END;",
    );
    const r = await maintenance.POST(
      post("/order", {
        idempotencyKey: crypto.randomUUID(),
        assignmentId: "a1",
        category: "general",
        description: "Atomic failure test only",
        urgency: "routine",
        preferredContact: "email",
        permissionToEnter: true,
        photos: [png],
      }),
    );
    expect(r.status).toBe(503);
    for (const table of [
      "tenant_maintenance_requests",
      "work_order_details",
      "work_order_events",
      "work_order_photos",
      "work_order_notifications",
    ])
      expect(sql.prepare("SELECT COUNT(*) AS n FROM " + table).get().n).toBe(0);
  });
});

it("legacy inserts remain compatible and older work orders are reachable through pagination", async () => {
  await signIn(tenant, "one@example.test", "teams_tenant_session");
  for (let i = 0; i < 53; i++)
    sql
      .prepare(
        "INSERT INTO tenant_maintenance_requests(id,tenant_id,assignment_id,category,description,urgency,preferred_contact) VALUES (?,'t1','a1','general','QA pagination fixture','routine','email')",
      )
      .run(crypto.randomUUID());
  const first = await (
    await maintenance.GET(new Request(origin + "/api/tenant/maintenance"))
  ).json();
  expect(first.requests).toHaveLength(50);
  expect(first.hasMore).toBe(true);
  const second = await (
    await maintenance.GET(
      new Request(
        origin +
          "/api/tenant/maintenance?before=" +
          first.requests.at(-1).number,
      ),
    )
  ).json();
  expect(second.requests).toHaveLength(3);
  expect(second.hasMore).toBe(false);
  expect(
    new Set([...first.requests, ...second.requests].map((r) => r.id)).size,
  ).toBe(53);
  expect(
    sql.prepare("SELECT COUNT(*) AS n FROM work_order_events").get().n,
  ).toBe(53);
  await signIn(admin, "qa-admin@example.test", "teams_admin_session");
  const adminPage = await (
    await adminOrders.GET(
      new Request(origin + "/api/admin/tenant-maintenance?page=1"),
    )
  ).json();
  expect(adminPage.requests).toHaveLength(3);
});

it("admin history/audit failure rolls back status and revision, and invalid tenant updates return validation errors", async () => {
  const o = await createOrder();
  await drain();
  expect(
    (
      await orderDetail.POST(
        post("/update", {
          idempotencyKey: crypto.randomUUID(),
          photos: [{ mime: "image/svg+xml", data: btoa("<svg>test</svg>") }],
        }),
        ctx(o.id),
      )
    ).status,
  ).toBe(400);
  await signIn(admin, "qa-admin@example.test", "teams_admin_session");
  sql.exec(
    "CREATE TRIGGER qa_fail_audit BEFORE INSERT ON audit_log WHEN NEW.action='updated' BEGIN SELECT RAISE(ABORT,'qa audit failure'); END;",
  );
  const response = await adminOrderDetail.PATCH(
    new Request(origin + "/order", {
      method: "PATCH",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({
        status: "scheduled",
        revision: 1,
        tenantUpdate: "Must roll back with failed audit",
      }),
    }),
    ctx(o.id),
  );
  expect(response.status).toBe(409);
  expect(
    sql
      .prepare("SELECT status FROM tenant_maintenance_requests WHERE id=?")
      .get(o.id).status,
  ).toBe("submitted");
  expect(
    sql
      .prepare("SELECT revision FROM work_order_details WHERE request_id=?")
      .get(o.id).revision,
  ).toBe(1);
  expect(
    sql
      .prepare("SELECT COUNT(*) AS n FROM work_order_events WHERE request_id=?")
      .get(o.id).n,
  ).toBe(1);
});

it("reopening clears the current completion date without erasing the historical completed event", async () => {
  const o = await createOrder();
  await drain();
  await signIn(admin, "qa-admin@example.test", "teams_admin_session");
  const patch = (status, revision) =>
    adminOrderDetail.PATCH(
      new Request(origin + "/order", {
        method: "PATCH",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify({ status, revision }),
      }),
      ctx(o.id),
    );
  expect((await patch("completed", 1)).status).toBe(200);
  await drain();
  expect(
    sql
      .prepare("SELECT completed_at FROM work_order_details WHERE request_id=?")
      .get(o.id).completed_at,
  ).toBeTruthy();
  expect((await patch("in_review", 2)).status).toBe(200);
  await drain();
  expect(
    sql
      .prepare("SELECT completed_at FROM work_order_details WHERE request_id=?")
      .get(o.id).completed_at,
  ).toBeNull();
  expect(
    sql
      .prepare(
        "SELECT COUNT(*) AS n FROM work_order_events WHERE request_id=? AND status='completed'",
      )
      .get(o.id).n,
  ).toBe(1);
});

it("labeled QA accounts produce unmistakable QA emails without changing normal notification routing", async () => {
  sql.exec(
    "UPDATE tenant_accounts SET display_name='[QA] Teams Tenant Portal' WHERE id='t1'",
  );
  state.env.WORK_ORDER_NOTIFY_TO = "office@example.test";
  await createOrder();
  await drain();
  const messages = state.mail.filter((m) => m.workOrder);
  expect(messages).toHaveLength(2);
  expect(messages.find(m => m.to === "office@example.test").body).toContain("Admin portal: https://teams-management-preview.pages.dev/admin/maintenance");
  expect(messages.find(m => m.to !== "office@example.test").body).toContain("Tenant portal: https://teams-management-preview.pages.dev/tenant/maintenance");
  expect(messages.every((m) => m.subject.startsWith("[QA] "))).toBe(true);
  expect(
    messages.every((m) =>
      m.body.startsWith(
        "QA validation only; no maintenance action is required.",
      ),
    ),
  ).toBe(true);
});

it('supports distinct scheduled/in-progress/cancelled states without rebuilding legacy requests or losing history', async()=>{
 const o=await createOrder();await drain();await signIn(admin,'qa-admin@example.test','teams_admin_session');
 for(const [index,status] of ['in_review','scheduled','in_progress','completed','cancelled'].entries()){
  const response=await adminOrderDetail.PATCH(new Request(origin+'/order',{method:'PATCH',headers:{origin,'content-type':'application/json'},body:JSON.stringify({status,revision:index+1})}),ctx(o.id));
  expect(response.status).toBe(200);await drain();const d=await (await adminOrderDetail.GET(new Request(origin+'/order'),ctx(o.id))).json();expect(d.request.status).toBe(status);
 }
 expect(sql.prepare('SELECT status FROM tenant_maintenance_requests WHERE id=?').get(o.id).status).toBe('closed');
 expect(sql.prepare('SELECT COUNT(*) AS n FROM tenant_maintenance_requests WHERE id=?').get(o.id).n).toBe(1);
 expect(sql.prepare('SELECT status FROM work_order_events WHERE request_id=? AND status IS NOT NULL ORDER BY rowid').all(o.id).map(x=>x.status)).toEqual(['submitted','in_review','scheduled','in_progress','completed','cancelled']);
});
it('disables property archiving even for a stale Admin page while allowing an audited restoration',async()=>{
 const {PATCH}=await import('../src/app/api/admin/buildings/[id]/route');await signIn(admin,'qa-admin@example.test','teams_admin_session');sql.exec("UPDATE buildings SET publication_state='draft' WHERE id='b1'");
 const update=state=>PATCH(new Request(origin+'/api/admin/buildings/b1',{method:'PATCH',headers:{origin,'content-type':'application/json'},body:JSON.stringify({publication_state:state})}),ctx('b1'));
 expect((await update('archived')).status).toBe(409);expect(sql.prepare("SELECT publication_state FROM buildings WHERE id='b1'").get().publication_state).toBe('draft');
 sql.exec("UPDATE buildings SET publication_state='archived' WHERE id='b1'");expect((await update('draft')).status).toBe(200);expect(sql.prepare("SELECT publication_state FROM buildings WHERE id='b1'").get().publication_state).toBe('draft');expect(sql.prepare("SELECT building_id FROM units WHERE id='u1'").get().building_id).toBe('b1');
});

it("fresh verified email-code login bootstraps a password; password login cannot bypass step-up or tenant isolation", async () => {
  await signIn(admin, "qa-admin@example.test", "teams_admin_session");
  const password = "Isolated initial passphrase 42";
  const save = () => new Request(origin + "/api/admin/password", {method:"PUT",headers:{origin,"content-type":"application/json"},body:JSON.stringify({email:"qa-admin@example.test",password})});
  expect((await passwords.PUT(save())).status).toBe(200);
  state.cookies.clear();
  expect((await passwords.POST(post("/api/admin/password", {email:"qa-admin@example.test",password}))).status).toBe(401);
  // Simulate browser enrollment only after the separately exercised verified OTP.
  const browserToken = "b".repeat(64);
  sql.prepare("INSERT INTO admin_remembered_browsers(token_hash,email,expires_at) VALUES (?,'qa-admin@example.test',datetime('now','+1 day'))").run(await hash(browserToken));
  const response = await passwords.POST(post("/api/admin/password", {email:"qa-admin@example.test",password}, {cookie:"__Host-teams_browser="+browserToken}));
  expect(response.status).toBe(200);
  state.cookies.set("teams_admin_session",response.headers.get("set-cookie").split(";")[0].split("=")[1]);
  expect(await currentAdmin()).toBe("qa-admin@example.test");
  expect(await currentTenant()).toBeNull();
  expect((await passwords.PUT(save())).status).toBe(403);
  state.cookies.clear();
  await signIn(tenant, "one@example.test", "teams_tenant_session");
  expect((await passwords.GET()).status).toBe(401);
  expect((await passwords.PUT(save())).status).toBe(401);
});
