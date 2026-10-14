import { NextResponse } from 'next/server';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';
export const runtime='edge';
export async function GET(){const admin=await requireAdmin();if(!admin)return unauthorized();const rows=await admin.db.prepare('SELECT r.id,r.category,r.description,r.urgency,r.preferred_contact,r.status,r.staff_notes,r.submitted_at,r.updated_at,a.email,b.name AS property_name,u.unit_identifier FROM tenant_maintenance_requests r JOIN tenant_accounts a ON a.id=r.tenant_id JOIN tenant_assignments ta ON ta.id=r.assignment_id JOIN buildings b ON b.id=ta.building_id JOIN units u ON u.id=ta.unit_id ORDER BY r.submitted_at DESC LIMIT 200').all();return NextResponse.json({requests:rows.results},{headers:{'Cache-Control':'no-store'}});}
