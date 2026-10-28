import {expect,it,vi} from 'vitest';
import {meterDatabase} from '../deployment/preview-runtime/d1-meter.mjs';
it('counts first/all/run and batch once without exporting records or bind values',async()=>{
 const raw={bind:vi.fn(()=>raw),all:vi.fn(async()=>({results:[{secret:'private'}],meta:{rows_read:7,rows_written:0,duration:1}})),run:vi.fn(async()=>({meta:{rows_read:2,rows_written:3,duration:2}}))};
 const db={prepare:vi.fn(()=>raw),batch:vi.fn(async()=>[{meta:{rows_read:4,rows_written:2,duration:1}}])};
 const report={queries:0,rowsRead:0,rowsWritten:0,durationMs:0};const metered=meterDatabase(db,report);
 expect(await metered.prepare('SELECT secret FROM test WHERE id=?').bind('private-id').first('secret')).toBe('private');
 await metered.prepare('UPDATE test SET a=?').bind('private').run();await metered.batch([metered.prepare('SELECT 1')]);
 expect(report).toMatchObject({queries:3,rowsRead:13,rowsWritten:5,durationMs:4});expect(db.batch).toHaveBeenCalledWith([raw]);expect(JSON.stringify(report)).not.toContain('private');
});
it('preserves null first and rejects a missing column',async()=>{
 const raw={all:async()=>({results:[],meta:{rows_read:0}})};const report={queries:0,rowsRead:0,rowsWritten:0,durationMs:0};
 expect(await meterDatabase({prepare:()=>raw},report).prepare('SELECT 1').first()).toBeNull();
});
it('retains database errors and marks failed queries instead of reporting measured zero',async()=>{
 const error=new Error('synthetic failure'),report={queries:0,rowsRead:0,rowsWritten:0,durationMs:0};const db=meterDatabase({prepare:()=>({all:async()=>{throw error;}})},report);
 await expect(db.prepare('SELECT synthetic').first()).rejects.toBe(error);expect(report).toMatchObject({failedQueries:1,queries:0});
});

it('marks successful queries with missing metadata as unmeasured rather than free',async()=>{
 const report={queries:0,rowsRead:0,rowsWritten:0,durationMs:0};
 const db=meterDatabase({prepare:()=>({all:async()=>({results:[{ok:1}]})})},report);
 expect(await db.prepare('SELECT 1').first('ok')).toBe(1);
 expect(report).toMatchObject({queries:1,missingMetadataQueries:1});
});
