import type { D1Database } from '@cloudflare/workers-types';
import { publicMediaSrc } from './media-management';
import { goldStreetGallery, previewPortfolio, previewPortfolioEnabled } from './preview-portfolio';

export const showcasePages = ['home','about','properties','retail','rent-with-us','gallery','contact','tenant-services'] as const;
export type ShowcasePage = typeof showcasePages[number];
export type Showcase = { property_id:string; property_name:string; property_slug:string; address_json:string; media_asset_id:string; storage_key:string; alt_text:string|null; caption:string|null; image:string };

const existingStaticImages=[...goldStreetGallery,'/preview-properties/166-e-118th-street.jpg','/preview-properties/3425-east-tremont-ave.jpg','/preview-properties/42-70-156th-street.jpg'];
const deliverableMedia = `AND (a.storage_key NOT LIKE '/preview-properties/%' OR a.storage_key IN (${existingStaticImages.map(path=>`'${path}'`).join(',')}))`;
const eligibility = `FROM buildings b JOIN media_assignments m ON m.building_id=b.id AND m.unit_id IS NULL JOIN media_publications p ON p.assignment_id=m.id AND p.published=1 JOIN media_assets a ON a.id=m.asset_id AND a.visibility='public' AND a.file_type LIKE 'image/%' ${deliverableMedia} WHERE ${previewPortfolioEnabled ? `b.slug IN (${previewPortfolio.map(()=>'?').join(',')}) AND b.publication_state='draft'` : `b.publication_state='published'`}`;
const columns = `b.id AS property_id,b.name AS property_name,b.slug AS property_slug,b.address_json,a.id AS media_asset_id,a.storage_key,COALESCE(NULLIF(m.alt_text,''),a.alt_text) AS alt_text`;

export async function eligibleShowcases(db:D1Database):Promise<Showcase[]> {
 const rows=(await db.prepare(`SELECT ${columns},NULL AS caption ${eligibility} ORDER BY b.name,m.is_cover DESC,m.order_index,m.created_at`).bind(...(previewPortfolioEnabled?previewPortfolio.map(item=>item.slug):[])).all<Omit<Showcase,'image'>>()).results;
 const seen=new Set<string>();
 return rows.map(row=>({...row,image:publicMediaSrc({id:row.media_asset_id,storage_key:row.storage_key} as Parameters<typeof publicMediaSrc>[0])}));
}

export async function pageShowcase(db:D1Database,page:ShowcasePage,retailIds?:string[]):Promise<Showcase|null> {
 const eligible=await eligibleShowcases(db);
 const unique=eligible.filter((row,index)=>eligible.findIndex(other=>other.property_id===row.property_id)===index);
 const pool=page==='retail' ? unique.filter(row=>retailIds?.includes(row.property_id)) : unique;
 if(!pool.length)return null;
 try {
  const assignment=await db.prepare(`SELECT s.property_id,s.media_asset_id,s.caption,${columns} FROM page_showcase_assignments s JOIN buildings b ON b.id=s.property_id JOIN media_assignments m ON m.building_id=b.id AND m.asset_id=s.media_asset_id AND m.unit_id IS NULL JOIN media_publications p ON p.assignment_id=m.id AND p.published=1 JOIN media_assets a ON a.id=s.media_asset_id AND a.visibility='public' AND a.file_type LIKE 'image/%' ${deliverableMedia} WHERE s.page=? AND s.published=1 AND ${previewPortfolioEnabled ? `b.slug IN (${previewPortfolio.map(()=>'?').join(',')}) AND b.publication_state='draft'` : `b.publication_state='published'`} ORDER BY s.order_index,s.id LIMIT 1`).bind(page,...(previewPortfolioEnabled?previewPortfolio.map(item=>item.slug):[])).first<Omit<Showcase,'image'>>();
  if(assignment && pool.some(row=>row.property_id===assignment.property_id))return {...assignment,image:publicMediaSrc({id:assignment.media_asset_id,storage_key:assignment.storage_key} as Parameters<typeof publicMediaSrc>[0])};
 } catch(error) {if(!(error instanceof Error) || !/no such table/i.test(error.message))throw error;}
 return pool[showcasePages.indexOf(page)%pool.length];
}
