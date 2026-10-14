import { boundedBody, BodyTooLarge } from '@/lib/request-body';
import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Database } from '@cloudflare/workers-types';
import { NextResponse } from 'next/server';
import { attemptInquiryNotification, type NotificationEnv } from '@/lib/inquiry-notifications';

export const runtime = 'edge';

const reply = (body: object, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const categories = new Set(['general', 'property', 'owner_business']);

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Invalid request origin' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Expected JSON' }, 415);
  try {
    const raw = new TextDecoder().decode(await boundedBody(request, 12000));
    if (raw.length > 12000) return reply({ error: 'Message is too long' }, 413);
    let input: Record<string, unknown>;
    try { input = JSON.parse(raw); } catch { return reply({ error: 'Invalid JSON' }, 400); }
    if (!input || Array.isArray(input) || typeof input !== 'object') return reply({ error: 'Invalid request' }, 400);
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
    const message = typeof input.message === 'string' ? input.message.trim() : '';
    const category = typeof input.category === 'string' ? input.category : '';
    const buildingSlug = typeof input.building === 'string' ? input.building : '';
    const propertyInterest = typeof input.propertyInterest === 'string' ? input.propertyInterest.trim() : '';
    const id = typeof input.idempotencyKey === 'string' ? input.idempotencyKey : '';
    if (!idPattern.test(id) || !categories.has(category) || name.length < 2 || name.length > 120 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        phone.length > 30 || message.length < 10 || message.length > 4000 || buildingSlug.length > 120 || propertyInterest.length > 120 ||
        /[\x00-\x1f]/.test(propertyInterest) ||
        (category === 'property' && (!propertyInterest && !buildingSlug || propertyInterest.length > 0 && propertyInterest.length < 3 || !/^\+?[\d\s().-]{7,30}$/.test(phone))) ||
        (category === 'property' && /\b\d{3}-?\d{2}-?\d{4}\b|\b(?:ssn|social security|driver.?s license|date of birth)\b/i.test(message))) {
      return reply({ error: 'Please check the required fields and try again' }, 400);
    }
    if (input.website) return reply({ received: true, id }, 202);

    const db = (getRequestContext().env as { DB?: D1Database }).DB;
    if (!db) throw new Error('Teams D1 binding unavailable');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email));
    const emailHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const existing = await db.prepare('SELECT i.contact_info_hash, i.category, d.message, d.property_interest FROM inquiries i LEFT JOIN inquiry_details d ON d.inquiry_id=i.id WHERE i.id = ? AND i.source = ?').bind(id, 'website').first<{ contact_info_hash: string; category: string; message: string | null; property_interest: string | null }>();
    if (existing) return existing.contact_info_hash === emailHash && (category !== 'property' || existing.category === category && existing.message === message && existing.property_interest === propertyInterest)
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
        db.prepare('INSERT INTO inquiry_details (inquiry_id, name, email, phone, message, building_id, property_interest) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, name, email, phone || null, message, buildingId, propertyInterest || null),
        db.prepare("INSERT INTO inquiry_notifications (inquiry_id, state) VALUES (?, 'pending')").bind(id),
      ]);
    } catch (error) {
      // A concurrent click may have committed the same receipt before this insert.
      const saved = await db.prepare('SELECT i.id FROM inquiries i JOIN inquiry_details d ON d.inquiry_id=i.id WHERE i.id = ? AND i.source = ? AND i.contact_info_hash = ? AND (? != ? OR (i.category=? AND d.message=? AND d.property_interest=?))').bind(id, 'website', emailHash, category, 'property', category, message, propertyInterest).first();
      if (saved) return reply({ received: true, id, duplicate: true }, 200);
      throw error;
    }
    // D1 commit is authoritative; delivery is asynchronous and cannot turn success into failure.
    const context = getRequestContext();
    context.ctx.waitUntil(attemptInquiryNotification(db, context.env as NotificationEnv, id));
    return reply({ received: true, id }, 201);
  } catch (error) {
    if (error instanceof BodyTooLarge) return reply({ error: 'Message is too long' }, 413);
    console.error('Inquiry submission failed:', error);
    return reply({ error: 'We could not save your inquiry. Please retry or use the email address on this page.' }, 503);
  }
}
