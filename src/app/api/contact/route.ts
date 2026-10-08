import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Database } from '@cloudflare/workers-types';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const reply = (body: object, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const categories = new Set(['general', 'property', 'owner_business']);

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Invalid request origin' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Expected JSON' }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 12000) return reply({ error: 'Message is too long' }, 413);
    const input = JSON.parse(raw) as Record<string, unknown>;
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
    const message = typeof input.message === 'string' ? input.message.trim() : '';
    const category = typeof input.category === 'string' ? input.category : '';
    const buildingSlug = typeof input.building === 'string' ? input.building : '';
    const id = typeof input.idempotencyKey === 'string' ? input.idempotencyKey : '';
    if (!idPattern.test(id) || !categories.has(category) || name.length < 2 || name.length > 120 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        phone.length > 30 || message.length < 10 || message.length > 4000 || buildingSlug.length > 120) {
      return reply({ error: 'Please check the required fields and try again' }, 400);
    }
    if (input.website) return reply({ received: true, id }, 202);

    const db = (getRequestContext().env as { DB?: D1Database }).DB;
    if (!db) throw new Error('Teams D1 binding unavailable');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email));
    const emailHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const existing = await db.prepare('SELECT contact_info_hash FROM inquiries WHERE id = ? AND source = ?').bind(id, 'website').first<{ contact_info_hash: string }>();
    if (existing) return existing.contact_info_hash === emailHash
      ? reply({ received: true, id, duplicate: true }, 200)
      : reply({ error: 'Receipt already used' }, 409);
    const recent = await db.prepare("SELECT COUNT(*) AS count FROM inquiries WHERE source = 'website' AND contact_info_hash = ? AND created_at >= datetime('now', '-1 hour')").bind(emailHash).first<{ count: number }>();
    if ((recent?.count || 0) >= 3) return reply({ error: 'Too many recent inquiries. Please try again later.' }, 429);

    let buildingId: string | null = null;
    if (buildingSlug) {
      const building = await db.prepare("SELECT id FROM buildings WHERE slug = ? AND publication_state = 'published'").bind(buildingSlug).first<{ id: string }>();
      if (!building) return reply({ error: 'Please select a published property' }, 400);
      buildingId = building.id;
    }
    try {
      await db.batch([
        db.prepare('INSERT INTO inquiries (id, source, category, contact_info_hash, status, routing_destination) VALUES (?, ?, ?, ?, ?, ?)').bind(id, 'website', category, emailHash, 'submitted', 'admin_inbox'),
        db.prepare('INSERT INTO inquiry_details (inquiry_id, name, email, phone, message, building_id) VALUES (?, ?, ?, ?, ?, ?)').bind(id, name, email, phone || null, message, buildingId),
      ]);
    } catch (error) {
      // A concurrent click may have committed the same receipt before this insert.
      const saved = await db.prepare('SELECT id FROM inquiries WHERE id = ? AND source = ? AND contact_info_hash = ?').bind(id, 'website', emailHash).first();
      if (saved) return reply({ received: true, id, duplicate: true }, 200);
      throw error;
    }
    return reply({ received: true, id }, 201);
  } catch (error) {
    console.error('Inquiry submission failed:', error);
    return reply({ error: 'We could not save your inquiry. Please retry or use the email address on this page.' }, 503);
  }
}
