import {expect,it,vi} from 'vitest';
import {preparedPhotoRequest,preparedPhotoResponse} from '../deployment/preview-runtime/prepared-photo.mjs';
import photos from '../src/lib/generated/photo-variants.json';
it('does not intercept sessions, tenant/admin photos, ordinary originals or mutations',()=>{for(const [path,method] of [['/api/admin/session','GET'],['/api/tenant/maintenance/photos/private?w=160','GET'],['/api/media/example','GET'],['/api/media/example?w=160','POST']])expect(preparedPhotoRequest(new Request('https://site.test'+path,{method}))).toBe(false);});
it('serves prepared bytes with the same security headers and source checks, without a renderer',async()=>{
 const photo=photos.find(p=>p.kind==='media')!,variant=photo.variants[0],asset={storage_key:photo.storageKey,file_type:'image/jpeg',visibility:'public',checksum:photo.assetChecksum};
 const first=vi.fn(async()=>asset);const statement={bind:()=>({first})};const fetch=vi.fn(async()=>new Response('prepared image'));
 const env={NEXT_PUBLIC_ENVIRONMENT:'preview',TEAMS_RELEASE_SHA:'test',DB:{prepare:()=>statement},ASSETS:{fetch}};
 const request=new Request(`https://site.test/api/media/${photo.id}?v=${photo.sourceSha256}&w=${variant.width}`);expect(preparedPhotoRequest(request)).toBe(true);
 const r=await preparedPhotoResponse(request,env);expect(r.status).toBe(200);expect(await r.text()).toBe('prepared image');expect(r.headers.get('x-teams-photo-pipeline')).toBe('prepared');expect(r.headers.get('content-security-policy')).toContain("form-action 'self'");expect(r.headers.get('x-robots-tag')).toContain('noindex');
 first.mockResolvedValueOnce({...asset,checksum:'changed'});expect((await preparedPhotoResponse(request,env)).status).toBe(404);expect(fetch).toHaveBeenCalledOnce();
 expect((await preparedPhotoResponse(request,{...env,NEXT_PUBLIC_ENVIRONMENT:'production'})).status).toBe(404);
});
