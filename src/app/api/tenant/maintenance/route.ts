import { boundedBody, BodyTooLarge } from '@/lib/request-body';
import { NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/admin-auth';
import { currentTenant, tenantDb } from '@/lib/tenant-auth';
export const runtime = 'nodejs';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function GET() {
  const tenant = await currentTenant();
  if (!tenant) return reply({ error: 'Unauthorized' }, 401);
  try {
    const result = await tenantDb().prepare("SELECT r.id,r.assignment_id,r.category,r.description,r.urgency,r.preferred_contact,r.status,r.submitted_at,b.name AS property_name,u.unit_identifier FROM tenant_maintenance_requests r JOIN tenant_assignments a ON a.id=r.assignment_id AND a.tenant_id=r.tenant_id AND a.active=1 JOIN buildings b ON b.id=a.building_id JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id WHERE r.tenant_id=? ORDER BY r.submitted_at DESC LIMIT 100").bind(tenant.id).all();
    return reply({ requests: result.results });
  } catch { return reply({ error: 'Request history is temporarily unavailable.' }, 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: 'Unauthorized' }, 401);
  const tenant = await currentTenant();
  if (!tenant) return reply({ error: 'Unauthorized' }, 401);
  let input: Record<string, unknown> | null;
  try { input = JSON.parse(new TextDecoder().decode(await boundedBody(request, 16000))); } catch (error) { return reply({ error: error instanceof BodyTooLarge ? 'Request is too long.' : 'Invalid request.' }, error instanceof BodyTooLarge ? 413 : 400); }
  const id = input?.idempotencyKey, assignmentId = input?.assignmentId, category = input?.category, description = input?.description, urgency = input?.urgency, preferredContact = input?.preferredContact;
  if (typeof id !== 'string' || !uuid.test(id) || typeof assignmentId !== 'string' || typeof category !== 'string' || !['plumbing','electrical','heating-cooling','appliance','general','other'].includes(category) || typeof description !== 'string' || description.trim().length < 10 || description.length > 3000 || !['routine','urgent'].includes(String(urgency)) || !['email','phone'].includes(String(preferredContact))) return reply({ error: 'Please complete all fields.' }, 400);
  const db = tenantDb();
  try {
    // Ownership and active assignment are enforced in the INSERT, not trusted from the browser.
    const [result] = await db.batch([db.prepare("INSERT INTO tenant_maintenance_requests (id,tenant_id,assignment_id,category,description,urgency,preferred_contact) SELECT ?,a.tenant_id,a.id,?,?,?,? FROM tenant_assignments a JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id WHERE a.id=? AND a.tenant_id=? AND a.active=1 ON CONFLICT(id) DO NOTHING").bind(id,category,description.trim(),urgency,preferredContact,assignmentId,tenant.id),
      db.prepare("INSERT INTO audit_log (id,action,entity_type,entity_id,record_after_json,user_actor) SELECT ?, 'submitted', 'tenant_maintenance_request', ?, ?, ? WHERE changes()=1").bind(crypto.randomUUID(), id, JSON.stringify({assignmentId,category,urgency}), tenant.id),
    ]);
    if (result.meta.changes === 1) {
      return reply({ id, status: 'submitted' }, 201);
    }
    const saved = await db.prepare('SELECT assignment_id,category,description,urgency,preferred_contact,status FROM tenant_maintenance_requests WHERE id=? AND tenant_id=?').bind(id,tenant.id).first<{ assignment_id:string;category:string;description:string;urgency:string;preferred_contact:string;status:string }>();
    if (saved) return saved.assignment_id === assignmentId && saved.category === category && saved.description === description.trim() && saved.urgency === urgency && saved.preferred_contact === preferredContact
      ? reply({ id, status: saved.status, duplicate: true }) : reply({ error: 'This receipt belongs to a different request.' }, 409);
    return reply({ error: 'Property or unit unavailable.' }, 403);
  } catch { return reply({ error: 'We could not save your request. Please retry.' }, 503); }
}
