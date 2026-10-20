import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';

describe('cookie-free sharing and first visits', () => {
  it('serves crawlers directly without requiring cookie persistence', () => {
    for (const agent of ['TelegramBot', 'facebookexternalhit/1.1', 'Mozilla/5.0']) {
      const response = middleware(new NextRequest('https://preview.test/', { headers: { 'user-agent': agent } }));
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
      expect(response.headers.get('x-middleware-request-cookie')).toContain('teams_feature_visit=0');
      expect(response.cookies.get('teams_feature_visit')?.value).toBe('0');
    }
  });
  it('advances rotation and preserves existing cookies in the rendered request', () => {
    const response = middleware(new NextRequest('https://preview.test/', { headers: { cookie: 'teams_feature_cursor=4; unrelated=kept' } }));
    expect(response.cookies.get('teams_feature_visit')?.value).toBe('5');
    expect(response.headers.get('x-middleware-request-cookie')).toContain('unrelated=kept');
    expect(response.headers.get('x-middleware-request-cookie')).toContain('teams_feature_visit=5');
  });
  it('still rejects unauthenticated admin API requests', () => {
    expect(middleware(new NextRequest('https://preview.test/api/admin/buildings')).status).toBe(404);
  });
});
