import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ eligible: vi.fn(), retail: vi.fn() }));
vi.mock('./admin-auth', () => ({ adminDb: () => ({}) }));
vi.mock('./page-showcase', () => ({ eligibleShowcases: mocks.eligible }));
vi.mock('./public-retail', () => ({ listPublicRetail: mocks.retail }));
import { dailyHeroStyle } from './daily-hero-style';
const photo = (id: string, slug = id) => ({ property_id: id, property_slug: slug, media_asset_id: id, image: `/photo-${id}.jpg` });
beforeEach(() => { vi.clearAllMocks(); mocks.eligible.mockResolvedValue([photo('residential')]); mocks.retail.mockResolvedValue([]); });
describe('daily header media isolation', () => {
  it.each(['about', 'contact', 'rent-with-us', 'properties'] as const)('%s requests only explicit residential covers', async page => {
    expect(await dailyHeroStyle(page)).toEqual({ '--gold-street-photo': 'url("/photo-residential.jpg")' });
    expect(mocks.eligible).toHaveBeenCalledWith({}, true, 'residential', true);
  });
  it('restricts retail to explicit covers of publicly listed retail properties', async () => {
    mocks.eligible.mockResolvedValue([photo('retail'), photo('not-listed')]);
    mocks.retail.mockResolvedValue([{ id: 'retail' }]);
    expect(await dailyHeroStyle('retail')).toEqual({ '--gold-street-photo': 'url("/photo-retail.jpg")' });
    expect(mocks.eligible).toHaveBeenCalledWith({}, true, 'retail', true);
  });
  it('never falls back to another context or a hardcoded photo', async () => {
    mocks.eligible.mockResolvedValue([]);
    expect(await dailyHeroStyle('retail')).toEqual({ '--gold-street-photo': 'none' });
    expect(await dailyHeroStyle('properties')).toEqual({ '--gold-street-photo': 'none' });
  });
  it('excludes the retail-only property from residential headers', async () => {
    mocks.eligible.mockResolvedValue([photo('retail-only', '3425-east-tremont-bronx')]);
    expect(await dailyHeroStyle('properties')).toEqual({ '--gold-street-photo': 'none' });
  });
});
