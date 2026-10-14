import type { MediaContext } from './media-presentation';
import type { D1Database } from '@cloudflare/workers-types';
import { publicMediaSrc, isDeliverablePublicMedia } from './media-management';
import { goldStreetGallery, previewPortfolio, previewPortfolioEnabled } from './preview-portfolio';

export const showcasePages = ['home','about','properties','retail','rent-with-us','gallery','contact','tenant-services'] as const;
export type ShowcasePage = typeof showcasePages[number];
export type Showcase = { property_id:string; property_name:string; property_slug:string; address_json:string; media_asset_id:string; storage_key:string; alt_text:string|null; caption:string|null; image:string };

const eligibility = `FROM buildings b JOIN media_assignments m ON m.building_id=b.id AND m.unit_id IS NULL JOIN media_publications p ON p.assignment_id=m.id AND p.published=1 JOIN media_assets a ON a.id=m.asset_id AND a.visibility='public' AND a.file_type LIKE 'image/%' WHERE ${previewPortfolioEnabled ? `b.slug IN (${previewPortfolio.map(()=>'?').join(',')}) AND b.publication_state='draft'` : `b.publication_state='published'`}`;
const columns = `b.id AS property_id,b.name AS property_name,b.slug AS property_slug,b.address_json,a.id AS media_asset_id,a.storage_key,COALESCE(NULLIF(m.alt_text,''),a.alt_text) AS alt_text`;

export async function eligibleShowcases(db:D1Database, coversOnly=true,context:MediaContext='residential'):Promise<Showcase[]> {
 const selection = coversOnly ? `AND (CASE WHEN EXISTS(SELECT 1 FROM media_presentation_settings s WHERE s.building_id=b.id AND s.context='${context}') THEN (a.id=(SELECT s.cover_asset_id FROM media_presentation_settings s WHERE s.building_id=b.id AND s.context='${context}') OR (m.is_cover=1 AND EXISTS(SELECT 1 FROM media_presentation_settings s WHERE s.building_id=b.id AND s.context='${context}' AND s.cover_asset_id IS NULL AND s.fallback_to_property_cover=1))) ELSE m.is_cover=1 END)` : '';
 const rows=(await db.prepare(`SELECT ${columns},NULL AS caption ${eligibility} ${selection} ORDER BY b.name,m.is_cover DESC,m.order_index,m.created_at`).bind(...(previewPortfolioEnabled?previewPortfolio.map(item=>item.slug):[])).all<Omit<Showcase,'image'>>()).results;
 return rows.filter(isDeliverablePublicMedia).map(row=>({...row,image:publicMediaSrc({id:row.media_asset_id,storage_key:row.storage_key} as Parameters<typeof publicMediaSrc>[0])}));
}
