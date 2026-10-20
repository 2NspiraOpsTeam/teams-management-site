import type { D1Database } from '@cloudflare/workers-types';
import type { MediaContext } from './media-presentation-input';
import { eligibleShowcases } from './page-showcase';
import { previewPortfolioEnabled } from './preview-portfolio';
import { publicDataCache } from './public-data-cache';

// Public pages only: the underlying query still enforces asset visibility,
// assignment publication, property scope and independent presentation contexts.
// Never cache visit-specific allocation or Admin/private media inventory here.
export function publicShowcases(db:D1Database,coversOnly=true,context:MediaContext='residential',explicitCoverOnly=false) {
  return publicDataCache(
    `showcase-${previewPortfolioEnabled?'preview':'published'}-${context}-${coversOnly?'covers':'all'}-${explicitCoverOnly?'explicit':'fallback'}`,
    ()=>eligibleShowcases(db,coversOnly,context,explicitCoverOnly),
  );
}
