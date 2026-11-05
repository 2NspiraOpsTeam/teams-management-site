import {afterEach,expect,it,vi} from 'vitest';
import {gzipSync} from 'node:zlib';
import full from '../src/lib/generated/photo-variants.json';
import delivery from '../src/lib/generated/photo-delivery.json';
afterEach(()=>{vi.unstubAllEnvs();vi.resetModules();});
it('keeps every public responsive URL identical while excluding server-only metadata from the browser',async()=>{
 vi.stubEnv('NEXT_PUBLIC_PREVIEW_PORTFOLIO','0');vi.stubEnv('NEXT_PUBLIC_PORTFOLIO_PRESENTATION','1');
 const server=await import('../src/lib/photo-variants');const client=await import('../src/lib/photo-delivery');
 for(const photo of full){
  expect(client.photoAttributes(photo.originalSrc,'100vw')).toEqual(server.photoAttributes(photo.originalSrc,'100vw'));
  for(const width of [160,480,960,1600,2560,10000])expect(client.highResolutionPhoto(photo.originalSrc,width)).toBe(server.highResolutionPhoto(photo.originalSrc,width));
 }
 const serialized=JSON.stringify(delivery);
 expect(serialized).not.toContain('storageKey');expect(serialized).not.toContain('assetChecksum');
 expect(gzipSync(serialized).length).toBeLessThan(gzipSync(JSON.stringify(full)).length/2);
 expect(client.photoAttributes('/api/tenant/maintenance/photos/private')).toEqual({src:'/api/tenant/maintenance/photos/private'});
});
it('keeps ordinary non-portfolio delivery unchanged',async()=>{
 vi.stubEnv('NEXT_PUBLIC_PREVIEW_PORTFOLIO','0');vi.stubEnv('NEXT_PUBLIC_PORTFOLIO_PRESENTATION','0');
 const client=await import('../src/lib/photo-delivery');
 expect(client.photoAttributes(full[0].originalSrc)).toEqual({src:full[0].originalSrc});
});
