import {describe,it,expect,vi} from 'vitest';
vi.mock('@/lib/admin-auth',()=>({adminEnv:()=>({}),requireAdmin:vi.fn()}));
import {normalizeOneDriveFile,oneDriveConfig} from '../src/lib/operations/onedrive-links';
const valid={name:'Signed lease.pdf',webUrl:'https://example-my.sharepoint.com/personal/user/Documents/lease.pdf',driveId:'b!drive_123-abc.def',itemId:'item123'};
describe('OneDrive references',()=>{
 it('keeps a permanent PDF reference, not file bytes or tokens',()=>{expect(normalizeOneDriveFile({...valid,access_token:'never-save',body:'never-save'})).toEqual(valid);});
 it.each(['http://example-my.sharepoint.com/a.pdf','https://example-my.sharepoint.com.attacker.test/a.pdf','https://attacker.test/a.pdf','javascript:alert(1)','https://u:p@example-my.sharepoint.com/a.pdf','https://example-my.sharepoint.com/a.pdf?download=1','https://example-my.sharepoint.com/a.pdf#token'])('rejects unsafe or temporary URL %s',webUrl=>expect(()=>normalizeOneDriveFile({...valid,webUrl})).toThrow());
 it('rejects non-PDF selections',()=>expect(()=>normalizeOneDriveFile({...valid,name:'lease.exe'})).toThrow());
 it('requires stable drive and item IDs',()=>expect(()=>normalizeOneDriveFile({...valid,itemId:''})).toThrow());
 it('is disabled until Microsoft registration is configured',()=>expect(oneDriveConfig().enabled).toBe(false));
});
