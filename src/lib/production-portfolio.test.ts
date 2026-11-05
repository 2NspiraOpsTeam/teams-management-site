import { afterEach, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({prepare:vi.fn(),all:vi.fn()}));
vi.mock('@opennextjs/cloudflare',()=>({getCloudflareContext:()=>({env:{DB:{prepare:mocks.prepare}}})}));
vi.mock('./public-data-cache',()=>({publicDataCache:async(_key:string,load:()=>Promise<unknown>)=>load()}));
afterEach(()=>{vi.unstubAllEnvs();vi.resetModules();});
it('retains approved presentation but requires published canonical records in production',async()=>{
 vi.stubEnv('NEXT_PUBLIC_PREVIEW_PORTFOLIO','0');vi.stubEnv('NEXT_PUBLIC_PORTFOLIO_PRESENTATION','1');vi.resetModules();
 mocks.prepare.mockImplementation(()=>({bind:()=>({all:mocks.all})}));
 mocks.all.mockResolvedValue({results:[{id:'real-property',slug:'1365-1st-ave',name:'1365 First Avenue',address_json:'{"street":"1365 First Avenue","city":"New York","state":"NY"}',publication_state:'published'}]});
 const flags=await import('./preview-portfolio');expect(flags.portfolioPresentationEnabled).toBe(true);expect(flags.previewPortfolioEnabled).toBe(false);
 const {canonicalPreviewBuildings}=await import('./public-buildings');const rows=await canonicalPreviewBuildings(flags.previewPortfolio);
 expect(rows).toHaveLength(1);expect(rows[0]).toMatchObject({id:'real-property',publication_state:'published',slug:'1365-1st-ave'});
 expect(mocks.prepare.mock.calls[0][0]).toContain("publication_state='published'");expect(mocks.prepare.mock.calls[0][0]).not.toContain("publication_state!='archived'");
 const {siteOrigin,reviewSite}=await import('./site-seo');expect(siteOrigin).toBe('https://www.teamsmanagement.com');expect(reviewSite).toBe(false);
});
